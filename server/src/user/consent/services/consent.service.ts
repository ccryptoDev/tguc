import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import moment from 'moment';
import fs from 'fs';
import { promisify } from 'util';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScreenTracking } from '../../screen-tracking/entities/screen-tracking.entity';
import { User } from '../../entities/user.entity';
import { UserConsent } from '../entities/consent.entity';
import { Agreement } from '../../../loans/entities/agreement.entity';
import { LoggerService } from '../../../logger/services/logger.service';
import { S3Service } from '../../../file-storage/services/s3.service';
import { PuppeteerService } from '../../../pdf/services/puppeteer.service';
import { PaymentManagement } from '../../../loans/payments/payment-management/payment-management.entity';
import { AppService } from '../../../app.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { AdminJwtPayload } from '../../../authentication/types/jwt-payload.types';
import { GenerateEFTADto } from '../../../loans/application/validation/generate-efta.dto';
import { ESignature } from '../../esignature/entities/esignature.entity';
import { LoanPaymentProCardToken } from '../../../loans/payments/loanpaymentpro/loanpaymentpro-card-token.entity';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    @InjectRepository(LoanPaymentProCardToken)
    private readonly loanPaymentProCardTokenModel: Repository<LoanPaymentProCardToken>,
    @InjectRepository(UserConsent)
    private readonly userConsentModel: Repository<UserConsent>,
    @InjectRepository(ESignature)
    private readonly esignatureModel: Repository<ESignature>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(Agreement)
    private readonly agreementModel: Repository<Agreement>,
    @InjectRepository(PaymentManagement)
    private readonly paymentManagementModel: Repository<PaymentManagement>,
    private readonly puppeteerService: PuppeteerService,
    private readonly nunjucksService: NunjucksService,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async createConsent(
    agreement: Agreement,
    user: User,
    ip: string,
    screenTrackingId: string,
    requestId: string,
    paymentManagementId?: string,
  ) {
    this.logger.log(
      'Creating consent with params:',
      `${ConsentService.name}#createConsent`,
      requestId,
      { agreement, user, ip, screenTrackingId, paymentManagementId },
    );
    const userConsent = {
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip: ip,
      phoneNumber: user.phones[0],
      signedAt: new Date(),
      user: user,
      screenTracking: screenTrackingId,
      paymentManagement: undefined,
      agreement: agreement,
      loanUpdated: 1,
    };
    if (paymentManagementId) {
      userConsent.paymentManagement = paymentManagementId;
    } else {
      const paymentManagement: PaymentManagement | null =
        await this.paymentManagementModel.findOne({
          user,
          screenTracking: screenTrackingId,
        });
      if (paymentManagement) {
        userConsent.paymentManagement = paymentManagement.id;
      }
    }
    let newConsent = this.userConsentModel.create(userConsent);
    newConsent = await this.userConsentModel.save(newConsent);
    this.logger.log(
      'Consent created',
      `${ConsentService.name}#createConsent`,
      requestId,
    );

    return newConsent;
  }

  async createConsents(screenTrackingId: string, request: Request) {
    const ip = (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress
    )
      .replace('::ffff:', '')
      .replace(/^::1$/, '127.0.0.1');
    this.logger.log(
      'Creating consents with params:',
      `${ConsentService.name}#createConsents`,
      request.id,
      {
        screenTrackingId,
        ip,
      },
    );

    const screenTracking = await this.screenTrackingModel.findOne({
      where: { id: screenTrackingId },
      relations: ['user'],
    });

    if (!screenTracking)
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `screen tracking record not found with screenId: ${screenTrackingId}`,
          request.id,
        ),
      );
    if (!screenTracking.user)
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `user record not found for screen tracking record with screenId: ${screenTrackingId}`,
          request.id,
        ),
      );
    const user: User = screenTracking.user as User;
    const consentPromises = [];
    ['120', '126'].forEach((documentKey) => {
      consentPromises.push(
        (async () => {
          const agreement: Agreement = await this.agreementModel.findOne({
            documentKey,
          });
          if (!agreement)
            throw new NotFoundException(
              this.appService.errorHandler(
                404,
                `could not find agreement for documentKey: ${documentKey} and practiceId: ${user.practiceManagement}`,
                request.id,
              ),
            );

          const userConsentDetails: UserConsent =
            await this.createConsentForDocuments(
              agreement,
              user,
              ip,
              screenTrackingId,
              request.id,
            );
          if (!userConsentDetails)
            throw new InternalServerErrorException(
              this.appService.errorHandler(
                500,
                `could not create consent for documents with documentKey: ${documentKey} and practiceId: ${user.practiceManagement}`,
                request.id,
              ),
            );

          const agreementsPath =
            documentKey === '120'
              ? 'agreements/esignature.html'
              : 'agreements/sms-policy.html';
          const createResp: UserConsent = await this.createStaticAgreementsPdf(
            userConsentDetails.id,
            userConsentDetails,
            screenTracking.applicationReference,
            agreementsPath,
            ip,
            request.id,
          );
          if (!createResp)
            throw new InternalServerErrorException(
              this.appService.errorHandler(
                500,
                `could not create static agreement pdf with documentKey: ${documentKey} and practiceId: ${user.practiceManagement}`,
                request.id,
              ),
            );

          return {
            agreement,
            userConsentDetails,
            createResp,
          };
        })(),
      );
    });

    const consents: any[] = await Promise.all(consentPromises);
    this.logger.log(
      `Created consents:`,
      `${ConsentService.name}#createConsents`,
      request.id,
      consents,
    );
  }

  /**
   *
   * @param agreement Agreement id
   * @param user User id
   * @param ip request ip
   * @param screenTrackingId Screen tracking id
   * @param requestId Unique request id
   * @param create Flag to create a new agreement or not
   */
  async createConsentForDocuments(
    agreement: Agreement,
    user: User,
    ip: string,
    screenTrackingId: string,
    requestId: string,
    create?: boolean,
  ) {
    this.logger.log(
      'Creating user consent with params: ',
      `${ConsentService.name}#createConsentForDocuments`,
      requestId,
      { agreement, user, ip, screenId: screenTrackingId, create },
    );
    const consentCriteria = {
      user: user.id,
      screenTracking: screenTrackingId,
      documentKey: agreement.documentKey,
    };
    const consentData = await this.userConsentModel.findOne(consentCriteria);

    if (consentData && !create) {
      const now = new Date();
      consentData.signedAt = now;

      await this.userConsentModel.save(consentData);

      this.logger.log(
        `Existing consent updated at:`,
        `${ConsentService.name}#createConsentForDocuments`,
        requestId,
        now,
      );

      return consentData;
    }

    const userConsent = {
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip: ip,
      phoneNumber: user.phones[0],
      signedAt: new Date(),
      user: user,
      screenTracking: screenTrackingId,
      agreement,
      loanUpdated: 1,
    };
    // const consent: UserConsent = new this.userConsentModel(userConsent);
    // await consent.save();
    const consent = await this.userConsentModel.save(userConsent);
    this.logger.log(
      'User consent created.',
      `${ConsentService.name}#createConsentForDocuments`,
      requestId,
    );

    return consent;
  }

  async createStaticAgreementsPdf(
    consentId: string,
    userConsent: UserConsent,
    applicationReference: string,
    agreementsPath: string,
    ip: string,
    requestId: string,
  ) {
    const html: string = await this.nunjucksService.htmlToString(
      agreementsPath,
      { ip, today: moment().format('MM/DD/YYYY') },
    );
    const userConsentDetails: UserConsent = await this.userConsentModel.findOne(
      { where: { id: consentId }, relations: ['agreement', 'user'] },
    );

    if (userConsent) {
      const userReference = (userConsentDetails.user as User).userReference;
      const replacedFilename = (
        userConsentDetails.agreement as Agreement
      ).documentName
        .split(' ')
        .join('_');
      const pdfFileName = `./${applicationReference}_${replacedFilename}_${Math.round(
        +new Date() / 1000,
      )}.pdf`;

      await this.puppeteerService.generatePDF(html, pdfFileName, requestId);
      await this.uploadTermsPdf(
        pdfFileName,
        userConsentDetails,
        applicationReference,
        userReference,
        requestId,
      );
      return userConsentDetails;
    }
  }

  async uploadRICPdf(ricData: any, agreement: Agreement, request: Request) {
    const { userData, screenTracking } = ricData;
    const fsUnlinkPromise = promisify(fs.unlink);
    const pdfFileLocalPath = `./${
      ricData.screenTracking.applicationReference
    }_${agreement.documentName}_${Math.round(+new Date() / 1000)}.pdf`;
    const html = await this.nunjucksService.htmlToString(
      'agreements/ric.html',
      ricData,
    );
    await this.puppeteerService.generatePDF(html, pdfFileLocalPath, request.id);

    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = `${userData.userReference}/${screenTracking.applicationReference}`;
    const s3Path = `${s3Folder}/${s3SubFolder}/${fileName}`;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      request.id,
    );

    await fsUnlinkPromise(pdfFileLocalPath);
    const s3DocumentsPath = this.s3Service.getS3Url(
      response.Location.split('/').slice(3).join('/'),
    );

    return s3DocumentsPath;
  }

  async uploadTermsPdf(
    pdfFileLocalPath: string,
    userConsentData: UserConsent,
    applicationReference: string,
    userReference: string,
    requestId: string,
  ): Promise<string> {
    this.logger.log(
      `Uploading user consent to S3 with params:`,
      `${S3Service.name}#uploadTermsPdf`,
      requestId,
      {
        pdfFileLocalPath,
        userConsentData,
        applicationReference,
        userReference,
      },
    );
    const fsUnlinkPromise = promisify(fs.unlink);
    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = userReference + '/' + applicationReference;
    const s3Path = s3Folder + '/' + s3SubFolder + '/' + fileName;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      requestId,
    );
    this.logger.log(
      'User consent uploaded to S3',
      `${S3Service.name}#uploadTermsPdf`,
      requestId,
    );
    await fsUnlinkPromise(pdfFileLocalPath);
    if (userConsentData) {
      userConsentData.agreementDocumentPath = this.s3Service.getS3Url(s3Path);
      await this.userConsentModel.save(userConsentData);
    }

    return response.Location;
  }

  async uploadPromissoryAgreementAsset(
    filePath: string,
    userConsentDocument: UserConsent,
    screenTrackingId: string,
    requestId: string,
  ) {
    const fileName = this.getOriginalNameFromUrl(filePath);
    const s3Folder = 'Agreements';
    const screenTracking = await this.screenTrackingModel.findOne({
      where: { id: screenTrackingId },
      relations: ['user'],
    });

    if (!screenTracking) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking not found.',
          requestId,
        ),
      );
    }

    const applicationReference = screenTracking.applicationReference;
    const userReference = (screenTracking.user as User).userReference;
    const s3Path =
      `${s3Folder}/${userReference}/${applicationReference}/${fileName}`.replace(
        /\s/g,
        '_',
      );
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(filePath),
      'application/pdf',
      requestId,
    );
    if (userConsentDocument) {
      userConsentDocument.screenTracking = screenTracking.id;
      userConsentDocument.agreementDocumentPath =
        this.s3Service.getS3Url(s3Path);
      await this.userConsentModel.save(userConsentDocument);
    }

    return response.Location;
  }

  async createEFTAAgreement(
    userId: string,
    generateEFTADto: GenerateEFTADto,
    request: Request,
  ) {
    let errorMessage = '';
    const user: User | null = await this.userModel.findOne({
      where: { id: userId },
      relations: ['screenTracking'],
    });

    if (!user) {
      errorMessage = `User id ${userId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    if (!user.screenTracking) {
      errorMessage = `Screen tracking for user id ${userId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    const paymentManagement = await this.paymentManagementModel.findOne({
      user: user.id,
    });
    if (!paymentManagement) {
      errorMessage = `Payment management for user id ${userId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const agreement: Agreement | null = await this.agreementModel.findOne({
      documentKey: '132',
    });
    if (!agreement) {
      errorMessage = `Agreement not found for documentKey "132"`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const ip = this.appService.getIPAddress(request);
    const todayDate = moment().startOf('day').format('MM/DD/YYYY');
    const loanStartDate = moment(paymentManagement.loanStartDate).format(
      'MM/DD/YYYY',
    );
    const context = {
      ...generateEFTADto,
      ip,
      todayDate,
      loanStartDate,
      resign: false,
    };
    const screenTracking = user.screenTracking as ScreenTracking;
    const fsUnlinkPromise = promisify(fs.unlink);
    const pdfFileLocalPath = `./${screenTracking.applicationReference}_${
      agreement.documentName
    }_${Math.round(+new Date() / 1000)}.pdf`;
    const html = await this.nunjucksService.htmlToString(
      'agreements/efta.html',
      context,
    );
    await this.puppeteerService.generatePDF(html, pdfFileLocalPath, request.id);
    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = `${user.userReference}/${screenTracking.applicationReference}`;
    const s3Path = `${s3Folder}/${s3SubFolder}/${fileName}`;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      request.id,
    );
    await fsUnlinkPromise(pdfFileLocalPath);
    const s3DocumentsPath = this.s3Service.getS3Url(
      response.Location.split('/').slice(3).join('/'),
    );

    let EFTADocument: UserConsent = this.userConsentModel.create({
      loanUpdated: 1,
      agreement,
      agreementDocumentPath: s3DocumentsPath,
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip,
      signedAt: new Date(),
      user: user.id,
      screenTracking: screenTracking.id,
      paymentManagement: paymentManagement.id,
    });
    EFTADocument = await this.userConsentModel.save(EFTADocument);

    return EFTADocument.id;
  }

  async resignEFTA(
    screenTrackingId: string,
    cardToken: string,
    request: Request,
  ) {
    let errorMessage = '';
    const screenTracking: ScreenTracking | null =
      await this.screenTrackingModel.findOne({
        where: { id: screenTrackingId },
        relations: ['user'],
      });
    if (!screenTracking) {
      errorMessage = `ScreenTracking id ${screenTrackingId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#resignEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    if (!screenTracking.user) {
      errorMessage = `User for screentracking id ${screenTrackingId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const userInfo = screenTracking.user as User;
    let ricSignature: string | undefined;
    const esignature: ESignature | null = await this.esignatureModel.findOne({
      user: screenTracking.user,
    });
    if (esignature) {
      const signature = await this.s3Service.downloadFile(
        esignature.signaturePath,
        request.id,
      );
      ricSignature = `data:${
        signature.ContentType
      };base64,${signature.Body.toString('base64')}`;
    }
    const cardInfo: LoanPaymentProCardToken | null =
      await this.loanPaymentProCardTokenModel.findOne({
        user: screenTracking.user,
        paymentMethodToken: cardToken,
      });
    if (!cardInfo) {
      errorMessage = `Card for user id ${screenTracking.user} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#resignEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    const generateEFTADto = {
      resign: true,
      signature: ricSignature,
      applicationReference: screenTracking.applicationReference,
      cardCode: cardInfo.cardCode,
      cardHolder: cardInfo.billingFirstName + ' ' + cardInfo.billingLastName,
      cardIssuer: '****',
      cardNumber: '************' + cardInfo.cardNumberLastFour,
      city: cardInfo.billingCity,
      expirationMonth: cardInfo.expMonth,
      expirationYear: cardInfo.expYear,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phones[0].phone,
      selectedOffer: screenTracking.offerData,
      selectedState: cardInfo.billingState,
      street: userInfo.street,
      zipCode: cardInfo.billingZip,
    };
    const paymentManagement = await this.paymentManagementModel.findOne({
      screenTracking: screenTrackingId,
    });
    if (!paymentManagement) {
      errorMessage = `Payment management for screentracking id ${screenTrackingId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#resignEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const agreement: Agreement | null = await this.agreementModel.findOne({
      documentKey: '132',
    });
    if (!agreement) {
      errorMessage = `Agreement not found for documentKey "132"`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const ip = this.appService.getIPAddress(request);
    const todayDate = moment().startOf('day').format('MM/DD/YYYY');
    const loanStartDate = moment(paymentManagement.loanStartDate).format(
      'MM/DD/YYYY',
    );
    const context = { ...generateEFTADto, ip, todayDate, loanStartDate };
    const user = screenTracking.user as User;
    const fsUnlinkPromise = promisify(fs.unlink);
    const pdfFileLocalPath = `./${screenTracking.applicationReference}_${
      agreement.documentName
    }_${Math.round(+new Date() / 1000)}.pdf`;
    const html = await this.nunjucksService.htmlToString(
      'agreements/efta.html',
      context,
    );
    await this.puppeteerService.generatePDF(html, pdfFileLocalPath, request.id);
    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = `${userInfo.userReference}/${screenTracking.applicationReference}`;
    const s3Path = `${s3Folder}/${s3SubFolder}/${fileName}`;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      request.id,
    );
    await fsUnlinkPromise(pdfFileLocalPath);
    const s3DocumentsPath = this.s3Service.getS3Url(
      response.Location.split('/').slice(3).join('/'),
    );

    let EFTADocument: UserConsent = this.userConsentModel.create({
      loanUpdated: 1,
      agreement,
      agreementDocumentPath: s3DocumentsPath,
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip,
      signedAt: new Date(),
      user: user.id,
      screenTracking: screenTracking.id,
      paymentManagement: paymentManagement.id,
    });
    EFTADocument = await this.userConsentModel.save(EFTADocument);

    return EFTADocument.id;
  }

  async getUserConsents(
    screenTrackingId: string,
    admin: AdminJwtPayload,
    requestId: string,
  ) {
    this.logger.log(
      'Getting user consents with params:',
      `${ConsentService.name}#getUserConsents`,
      requestId,
      { screenTrackingId, admin },
    );

    const screenTrackingDocument: ScreenTracking | null =
      await this.screenTrackingModel.findOne({
        where: {
          id: screenTrackingId,
        },
        relations: ['user'],
      });

    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${ConsentService.name}#getUserConsents`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (!screenTrackingDocument.user) {
      const errorMessage = `Could not find the user screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${ConsentService.name}#getUserConsents`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const userConsents: UserConsent[] | null = await this.userConsentModel.find(
      {
        screenTracking: screenTrackingDocument.id,
      },
    );

    if (!userConsents || userConsents.length <= 0) {
      const errorMessage = `No consents found for screen tracking id ${screenTrackingDocument.id}`;
      this.logger.error(
        errorMessage,
        `${ConsentService.name}#getUserDocuments`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Got user consents:',
      `${ConsentService.name}#getUserDocuments`,
      requestId,
      userConsents,
    );

    return userConsents;
  }

  getOriginalNameFromUrl(url: string): string {
    const urlArray: string[] = url.split('/');

    return urlArray[urlArray.length - 1];
  }
}
