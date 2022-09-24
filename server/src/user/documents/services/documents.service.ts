import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ManagedUpload } from 'aws-sdk/clients/s3';

import { AppService } from '../../../app.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { S3Service } from '../../../file-storage/services/s3.service';
import { User } from '../../entities/user.entity';
import { UserDocuments } from '../entities/documents.entity';
import UploadDocDto from '../validation/uploadDoc.dto';
import UploadDocsDto from '../validation/uploadDocs.dto';
import {
  AdminJwtPayload,
  UserJwtPayload,
} from '../../../authentication/types/jwt-payload.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScreenTracking } from 'src/user/screen-tracking/entities/screen-tracking.entity';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { SendGridService } from '../../../email/services/sendgrid.service';
import Config from '../../../app.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserDocumentsService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    @InjectRepository(UserDocuments)
    private readonly userDocumentsModel: Repository<UserDocuments>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingRepository: Repository<ScreenTracking>,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly nunjucksService: NunjucksService,
    private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
  ) {}

  async uploadDocument(
    uploadDocDto: UploadDocDto,
    requestId: string,
    uploaderPayload: AdminJwtPayload & UserJwtPayload,
    screenTrackingId?: string,
  ): Promise<{ documentId: string }> {
    const {
      documentType,
      driversLicenseBack,
      driversLicenseFront,
      passport,
      docArray,
    } = uploadDocDto;
    let { userId } = uploadDocDto;
    this.logger.log(
      "Uploading user's document with params:",
      `${UserDocumentsService.name}#uploadDocument`,
      requestId,
      uploadDocDto,
    );

    let user: User | null;
    if (screenTrackingId) {
      const screenTracking = await this.screenTrackingRepository.findOne({
        where: {
          id: screenTrackingId,
        },
        relations: ['user'],
      });
      user = screenTracking.user as User;
      user.screenTracking = screenTracking;
    } else {
      user = await this.userModel.findOne({
        where: {
          id: userId,
        },
        relations: ['screenTracking'],
      });
    }
    if (!user) {
      const errorMessage = screenTrackingId
        ? `User not found for screen tracking id ${screenTrackingId}`
        : `User id ${userId} not found`;
      this.logger.error(
        errorMessage,
        `${UserDocumentsService.name}#uploadDocument`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    if (screenTrackingId) {
      userId = user.id;
    }
    if (documentType === 'drivers license') {
      const driversLicenseFrontFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(driversLicenseFront, requestId);
      const driversLicenseBackFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(driversLicenseBack, requestId);
      const driversLicenseFrontBuffer = Buffer.from(
        driversLicenseFront,
        'base64',
      );
      const driversLicenseBackBuffer = Buffer.from(
        driversLicenseBack,
        'base64',
      );
      const s3Response: ManagedUpload.SendData[] = await Promise.all([
        this.s3Service.uploadFile(
          `UserDocuments/${userId}/DriversLicense/front.${driversLicenseFrontFormat.extension}`,
          driversLicenseFrontBuffer,
          driversLicenseFrontFormat.contentType,
          requestId,
        ),
        this.s3Service.uploadFile(
          `UserDocuments/${userId}/DriversLicense/back.${driversLicenseFrontFormat.extension}`,
          driversLicenseBackBuffer,
          driversLicenseBackFormat.contentType,
          requestId,
        ),
      ]);
      const s3DocumentsPath: string[] = s3Response.map((document) =>
        document.Location.split('/').slice(3).join('/'),
      );
      const driversLicense = {
        front: this.s3Service.getS3Url(s3DocumentsPath[0]),
        back: this.s3Service.getS3Url(s3DocumentsPath[1]),
      };

      let userDocuments: UserDocuments = this.userDocumentsModel.create({
        driversLicense: driversLicense,
        type: documentType,
        user: userId,
        uploaderRole: uploaderPayload.role,
        uploaderName:
          uploaderPayload.role === 'User'
            ? `${uploaderPayload.firstName} ${uploaderPayload.lastName}`
            : uploaderPayload.userName,
        uploaderId: uploaderPayload.id,
      });
      userDocuments = await this.userDocumentsModel.save(userDocuments);

      const response = { documentId: userDocuments.id as string };
      this.logger.log(
        "User's document uploaded",
        `${UserDocumentsService.name}#uploadDocument`,
        requestId,
        response,
      );

      return response;
    } else if (documentType === 'passport') {
      // handle passport upload
      const passportFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(passport, requestId);
      const passportBuffer = Buffer.from(passport, 'base64');
      const s3Response = await this.s3Service.uploadFile(
        `UserDocuments/${userId}/passport.${passportFormat.extension}`,
        passportBuffer,
        passportFormat.contentType,
        requestId,
      );
      let userDocuments = this.userDocumentsModel.create({
        document: this.s3Service.getS3Url(
          s3Response.Location.split('/').slice(3).join('/'),
        ),
        type: documentType,
        user: userId,
        uploaderRole: uploaderPayload.role,
        uploaderName:
          uploaderPayload?.firstName ?? uploaderPayload?.userName ?? 'no name',
        uploaderId: uploaderPayload.id,
      });
      userDocuments = await this.userDocumentsModel.save(userDocuments);

      const response = { documentId: userDocuments.id as string };
      this.logger.log(
        "User's document uploaded",
        `${UserDocumentsService.name}#uploadDocument`,
        requestId,
        response,
      );
      return response;
    } else {
      // handle passport upload
      let savedResponse = [];
      let docType;
      docArray.map(async (doc) => {
        const documentFormat: {
          extension: string;
          contentType: string;
        } = this.getBase64FileFormat(doc.value, requestId);
        docType = doc.type;
        const documentBuffer = Buffer.from(doc.value, 'base64');
        const s3Response = await this.s3Service.uploadFile(
          `UserDocuments/${userId}/${docType}.${documentFormat.extension}`,
          documentBuffer,
          documentFormat.contentType,
          requestId,
        );
        let userDocuments = this.userDocumentsModel.create({
          document: this.s3Service.getS3Url(
            s3Response.Location.split('/').slice(3).join('/'),
          ),
          type: doc.type,
          user: userId,
          uploaderRole: uploaderPayload.role,
          uploaderName:
            uploaderPayload?.firstName ??
            uploaderPayload?.userName ??
            'no name',
          uploaderId: uploaderPayload.id,
        });
        userDocuments = await this.userDocumentsModel.save(userDocuments);
        const response = { documentId: userDocuments.id as string };
        this.logger.log(
          "User's document uploaded",
          `${UserDocumentsService.name}#uploadDocument`,
          requestId,
          response,
        );
        return savedResponse.push(response);
      });
      // Send welcome email to contractor
      if (
        user?.screenTracking instanceof ScreenTracking &&
        user?.screenTracking.isContractor
      ) {
        const html: string = await this.nunjucksService.htmlToString(
          'emails/application-contractor-thankyou.html',
          {
            userName: `${user.firstName} ${user.lastName}`,
            baseUrl: Config().baseUrl,
          },
        );
        const fromName = this.configService.get<string>('sendGridFromName');
        const fromEmail = this.configService.get<string>('sendGridFromEmail');
        await this.sendGridService.sendEmail(
          `${fromName} <${fromEmail}>`,
          user.email,
          `TGUC credit application`,
          html,
          requestId,
        );
      }
      return savedResponse[0];
    }
  }

  // async uploadDocuments(
  //   uploadDocDto: UploadDocsDto,
  //   requestId: string,
  //   uploaderPayload: AdminJwtPayload & UserJwtPayload,
  //   screenTrackingId?: string,
  // ): Promise<{ documentId: string }> {
  //   const { document } = uploadDocDto;
  //   let { userId } = uploadDocDto;
  //   this.logger.log(
  //     "Uploading user's document with params:",
  //     `${UserDocumentsService.name}#uploadDocument`,
  //     requestId,
  //     uploadDocDto,
  //   );

  //   let user: User | null;
  //   if (screenTrackingId) {
  //     const screenTracking = await this.screenTrackingRepository.findOne({
  //       where: {
  //         id: screenTrackingId,
  //       },
  //       relations: ['user'],
  //     });
  //     user = screenTracking.user as User;
  //   } else {
  //     user = await this.userModel.findOne({
  //       id: userId,
  //     });
  //   }
  //   if (!user) {
  //     const errorMessage = screenTrackingId
  //       ? `User not found for screen tracking id ${screenTrackingId}`
  //       : `User id ${userId} not found`;
  //     this.logger.error(
  //       errorMessage,
  //       `${UserDocumentsService.name}#uploadDocument`,
  //       requestId,
  //     );
  //     throw new NotFoundException(
  //       this.appService.errorHandler(404, errorMessage, requestId),
  //     );
  //   }

  //   if (screenTrackingId) {
  //     userId = user.id;
  //   }

  //   // handle passport upload
  //   const passportFormat: {
  //     extension: string;
  //     contentType: string;
  //   } = this.getBase64FileFormat(document, requestId);
  //   const passportBuffer = Buffer.from(document, 'base64');
  //   const s3Response = await this.s3Service.uploadFile(
  //     `UserDocuments/${userId}/passport.${passportFormat.extension}`,
  //     passportBuffer,
  //     passportFormat.contentType,
  //     requestId,
  //   );
  //   let userDocuments = this.userDocumentsModel.create({
  //     passport: this.s3Service.getS3Url(
  //       s3Response.Location.split('/').slice(3).join('/'),
  //     ),
  //     user: userId,
  //     uploaderRole: uploaderPayload.role,
  //     uploaderName:
  //       uploaderPayload?.firstName ?? uploaderPayload?.userName ?? 'no name',
  //     uploaderId: uploaderPayload.id,
  //   });
  //   userDocuments = await this.userDocumentsModel.save(userDocuments);

  //   const response = { documentId: userDocuments.id as string };
  //   this.logger.log(
  //     "User's document uploaded",
  //     `${UserDocumentsService.name}#uploadDocument`,
  //     requestId,
  //     response,
  //   );

  //   return response;
  // }
  async updateDocumentStatusByAdmin(
    documentId: string,
    status: any,
    reason: string | null,
    requestId: string,
  ) {
    this.logger.log(
      'Updating user documents with params:' + documentId,
      `${UserDocumentsService.name}#updateDocumentStatusByAdmin`,
      requestId,
      { documentId },
    );
    const userDocument: any | null = await this.userDocumentsModel.findOne({
      where: { id: documentId },
      relations: ['user'],
    });
    if (!userDocument) {
      const errorMessage = `Could not find document id id ${documentId}`;
      this.logger.error(
        errorMessage,
        `${UserDocumentsService.name}#updateDocumentStatusByAdmin`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const user = userDocument?.user;
    const userEmail = user?.email;
    const updateDoc = await this.userDocumentsModel.update(
      { id: userDocument.id },
      {
        status: status,
        reason: reason || null,
      },
    );
    if (status === 'denied') {
      if (reason === 'Other') {
        // TODO: Improve by using enmus instead of strings
        reason = 'Other reason, please contact us at 720-903-4448';
      }
      const context = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        baseUrl: Config().baseUrl,
        reason: reason || null,
        docType: userDocument.type || null,
      };
      const html = await this.nunjucksService.htmlToString(
        'emails/denied-document.html',
        context,
      );
      try {
        const fromName = this.configService.get<string>('sendGridFromName');
        const fromEmail = this.configService.get<string>('sendGridFromEmail');
        await this.sendGridService.sendEmail(
          `${fromName} <${fromEmail}>`,
          userEmail,
          'TGUC Financial Application',
          html,
          requestId,
        );
      } catch (e) {
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Error #sendEmailBasedOnStatusChange ${userEmail} ${e}`,
            requestId,
          ),
        );
      }
    }
    return updateDoc;
  }
  async getUserDocuments(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting user documents with params:',
      `${UserDocumentsService.name}#getUserDocuments`,
      requestId,
      { screenTrackingId },
    );

    const screenTracking: ScreenTracking | null =
      await this.screenTrackingRepository.findOne({
        where: {
          id: screenTrackingId,
        },
        relations: ['user'],
      });
    const user = screenTracking.user as User;
    if (!user) {
      const errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${UserDocumentsService.name}#getUserDocuments`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const userDocuments: UserDocuments[] | null =
      await this.userDocumentsModel.find({
        user: user.id,
      });

    if (!userDocuments || userDocuments.length <= 0) {
      const errorMessage = `No documents found for user id ${user.id}`;
      this.logger.error(
        errorMessage,
        `${UserDocumentsService.name}#getUserDocuments`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Got user documents:',
      `${UserDocumentsService.name}#getUserDocuments`,
      requestId,
      userDocuments,
    );

    return userDocuments;
  }

  getBase64FileFormat(
    imageBase64: string,
    requestId: string,
  ): { extension: string; contentType: string } {
    this.logger.log(
      'Getting file format for base64 string',
      `${UserDocumentsService.name}#getBase64FileFormat`,
      requestId,
      imageBase64,
    );
    const fileExtensionSignatures = {
      iVBORw0KGgo: { extension: 'png', contentType: 'image/png' },
      JVBERi0: { extension: 'pdf', contentType: 'application/pdf' },
      '/9j/': { extension: 'jpeg', contentType: 'image/jpeg' },
    };
    let isFormatSupported = false;

    const response: { extension: string; contentType: string } = {
      extension: '',
      contentType: '',
    };
    for (const extensionSignature in fileExtensionSignatures) {
      if (
        Object.prototype.hasOwnProperty.call(
          fileExtensionSignatures,
          extensionSignature,
        )
      ) {
        if (imageBase64.indexOf(extensionSignature) === 0) {
          response.extension =
            fileExtensionSignatures[extensionSignature].extension;
          response.contentType =
            fileExtensionSignatures[extensionSignature].contentType;
          isFormatSupported = true;

          break;
        }
      }
    }

    if (!isFormatSupported) {
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          'Only .png, .jpeg or .pdf files are supported',
          requestId,
        ),
      );
    }

    this.logger.log(
      'Base 64 file format:',
      `${UserDocumentsService.name}#getBase64FileFormat`,
      requestId,
      response,
    );

    return response;
  }
}
