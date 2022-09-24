import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import crypto from 'crypto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScreenTracking } from '../../screen-tracking/entities/screen-tracking.entity';
import { User } from '../../entities/user.entity';
import { ESignature } from '../entities/esignature.entity';
import { SaveSignatureDto } from '../validation/saveSignature.dto';
import { LoggerService } from '../../../logger/services/logger.service';
import { UserConsent } from '../../consent/entities/consent.entity';
import { S3Service } from '../../../file-storage/services/s3.service';
import { AppService } from '../../../app.service';

@Injectable()
export class EsignatureService {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(ESignature)
    private readonly esignatureModel: Repository<ESignature>,
    @InjectRepository(UserConsent)
    private readonly userConsentModel: Repository<UserConsent>,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async saveSignature(saveSignatureDto: SaveSignatureDto, request: Request) {
    this.logger.log(
      'Saving signature with params:',
      `${EsignatureService.name}#saveSignature`,
      request.id,
      saveSignatureDto,
    );
    const { screenTrackingId, hiddenSignatureId, imgBase64 } = saveSignatureDto;
    const ip = this.appService.getIPAddress(request);
    const userAgent = request.headers['user-agent'];
    const screenTracking: ScreenTracking | null =
      await this.screenTrackingModel.findOne({
        where: {
          id: screenTrackingId,
        },
        relations: ['user'],
      });

    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${EsignatureService.name}#saveSignature`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found`,
          request.id,
        ),
      );
    }
    const existingEsignature: ESignature | null =
      await this.esignatureModel.findOne({
        screenTracking: screenTracking.id,
      });
    if (existingEsignature) {
      this.logger.error(
        'Esignature already exists',
        `${EsignatureService.name}#saveSignature`,
        request.id,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          'Signature already saved',
          request.id,
        ),
      );
    }
    if (!screenTracking.user) {
      this.logger.error(
        'User for this screen tracking not found',
        `${EsignatureService.name}#saveSignature`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `User for screen tracking id ${screenTrackingId} not found`,
          request.id,
        ),
      );
    }

    const user: User = screenTracking.user as User;
    const userConsent: UserConsent | null = await this.userConsentModel.findOne(
      { user: user.id },
    );
    if (!userConsent) {
      this.logger.error(
        'Consent not found',
        `${EsignatureService.name}#saveSignature`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Consent for this user not found',
          request.id,
        ),
      );
    }
    const seed: Buffer = crypto.randomBytes(20);
    const uniqueSHA1String = crypto
      .createHash('sha1')
      .update(seed)
      .digest('hex');
    const fileData: {
      fileExtension: string;
      buffer: Buffer;
    } = this.base64PngToBuffer(imgBase64, request.id);
    const fileName = `image-${uniqueSHA1String}`;
    if (!hiddenSignatureId) {
      const s3Path = `Esignature/${user.userReference}/${screenTracking.applicationReference}/${fileName}.${fileData.fileExtension}`;
      const signature = {
        consent: userConsent.id,
        device: userAgent,
        fullName: `${user.firstName} ${user.lastName}`,
        ipAddress: ip,
        screenTracking: screenTrackingId,
        signature: `${fileName}.${fileData.fileExtension}`,
        signaturePath: s3Path,
        user: user.id,
      };
      const esignature = this.esignatureModel.create(signature);
      await this.esignatureModel.save(esignature);

      await this.s3Service.uploadFile(
        s3Path,
        fileData.buffer,
        'image/png',
        request.id,
      );
      await this.screenTrackingModel.update(
        { id: screenTrackingId },
        { lastLevel: 'sign-contract' },
      );

      const response = {
        esignatureId: esignature.id,
      };
      this.logger.log(
        'Saved signature.',
        `${EsignatureService.name}#saveSignature`,
        request.id,
        response,
      );

      return response;
    } else {
      const updateParams = {
        fullName: `${user.firstName} ${user.lastName}`,
        ipAddress: ip,
        device: userAgent,
      };
      this.logger.log(
        'Updating existing signature with params:',
        `${EsignatureService.name}#saveSignature`,
        request.id,
        updateParams,
      );
      await this.esignatureModel.update(
        { id: hiddenSignatureId },
        updateParams,
      );
      const response = {
        esignatureId: hiddenSignatureId,
      };
      this.logger.log(
        'Updated existing signature',
        `${EsignatureService.name}#saveSignature`,
        request.id,
        response,
      );

      return response;
    }
  }

  base64PngToBuffer(imageBase64: string, requestId: string) {
    const pngExtensionSignature = 'iVBORw0KGgo';
    if (!(imageBase64.indexOf(pngExtensionSignature) === 0)) {
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          'Only PNG files are supported',
          requestId,
        ),
      );
    }

    const response = {
      fileExtension: 'png',
      buffer: Buffer.from(imageBase64, 'base64'),
    };

    return response;
  }
}
