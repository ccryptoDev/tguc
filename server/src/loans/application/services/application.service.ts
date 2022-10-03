import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { Request } from 'express';
import moment from 'moment';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk';
import s3 from 'aws-sdk/clients/s3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';

import { PaymentManagement } from '../../payments/payment-management/payment-management.entity';
import { PaymentManagementService } from '../../payments/payment-management/payment-management.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { User } from '../../../user/entities/user.entity';
import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { Agreement } from '../../entities/agreement.entity';
import { UserConsent } from '../../../user/consent/entities/consent.entity';
import { ESignature } from '../../../user/esignature/entities/esignature.entity';
import { ConsentService } from '../../../user/consent/services/consent.service';
import { S3Service } from '../../../file-storage/services/s3.service';
import { AppService } from '../../../app.service';
import { SendGridService } from '../../../email/services/sendgrid.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { ConfigService } from '@nestjs/config';
import { MiddeskService } from '../../../user/underwriting/middesk/middesk.service';
import { ExperianService } from '../../../user/underwriting/experian/services/experian.service';
import { ProductService } from '../../../user/underwriting/product/services/product.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    @InjectRepository(ESignature)
    private readonly esignatureModel: Repository<ESignature>,
    @InjectRepository(UserConsent)
    private readonly userConsentModel: Repository<UserConsent>,
    @InjectRepository(PaymentManagement)
    private readonly paymentManagementModel: Repository<PaymentManagement>,
    @InjectRepository(Agreement)
    private readonly agreementModel: Repository<Agreement>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(PracticeManagement)
    private readonly practiceManagementModel: Repository<PracticeManagement>,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly userConsentService: ConsentService,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly mailService: SendGridService,
    private readonly nunjucksService: NunjucksService,
    private readonly configService: ConfigService,
    private readonly middeskService: MiddeskService,
    private readonly experianService: ExperianService,
    private readonly productService: ProductService,
  ) {}

  async createLoan(
    screenTrackingId: string,
    userId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Creating loan with params:',
      `${ApplicationService.name}#createLoan`,
      requestId,
      { screenTrackingId, userId },
    );
    const user: User | null = await this.userModel.findOne({
      id: userId,
    });
    if (!user) {
      this.logger.error(
        'User not found',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, 'User not found.', requestId),
      );
    }
    const screenTracking: ScreenTracking | null =
      await this.screenTrackingModel.findOne({
        where: {
          id: screenTrackingId,
          isCompleted: false,
          user: userId,
        },
        relations: ['user', 'practiceManagement'],
        order: {
          createdAt: 'DESC',
        },
      });

    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found or application is already complete',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          `User screen tracking not found or application is already complete.`,
          requestId,
        ),
      );
    }
    if (!screenTracking.offerData) {
      this.logger.error(
        'No offers found for this screen tracking',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          'No offers found for this screen tracking',
          requestId,
        ),
      );
    }
    const existingLoan: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        where: {
          screenTracking: screenTracking.id,
          status: Not(In(['expired', 'approved', 'pending'])),
        },
      });
    if (existingLoan) {
      this.logger.error(
        'User already has an existing loan',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          'User already has an existing loan',
          requestId,
        ),
      );
    }

    const paymentDetails: PaymentManagement =
      await this.paymentManagementService.createLoanPaymentSchedule(
        screenTracking,
        requestId,
      );
    if (!paymentDetails) {
      this.logger.error(
        'Error creating loan payment schedule.',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new InternalServerErrorException(
        this.appService.errorHandler(
          500,
          'Error creating loan payment schedule.',
          requestId,
        ),
      );
    }

    const lastLevel = screenTracking.skipAutoPay
      ? 'document-upload'
      : 'repayment';
    await this.screenTrackingModel.update(screenTracking.id, {
      lastLevel,
    });
    const updatedUserScreenTracking = await this.screenTrackingModel.findOne(
      screenTracking.id,
    );

    if (
      !(
        updatedUserScreenTracking.lastLevel === 'repayment' ||
        updatedUserScreenTracking.lastLevel === 'document-upload'
      )
    ) {
      this.logger.error(
        'Error creating loan payment schedule.',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new InternalServerErrorException(
        this.appService.errorHandler(
          500,
          'User screen tracking not updated.',
          requestId,
        ),
      );
    }

    await this.userModel.update(
      { id: userId },
      {
        isExistingLoan: true,
      },
    );

    this.welcomeEmail(user, screenTracking, paymentDetails);
  }

  async welcomeEmail(
    user: User,
    sTracking: ScreenTracking,
    payment: PaymentManagement,
  ) {
    try {
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-welcome.html',
        {
          userName: `${user.firstName} ${user.lastName}`,
          dateCreated: moment(user.createdAt).format('MM/DD/YYYY'),
          payOff: `$${sTracking.offerData.loanAmount}`,
          financingTerm: sTracking.offerData.term,
          payoffTerm: sTracking.offerData.promoTerm,
          minAmt: `$${sTracking.offerData.monthlyPayment}`,
          payOffPromo: `$${parseFloat(
            (
              sTracking.offerData.loanAmount / sTracking.offerData.promoTerm
            ).toFixed(2),
          )}`,
          link: `${baseUrl}/login`,
        },
      );
      const subject = 'Welcome Email';
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      const from = `${fromName} <${fromEmail}>`;
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, '');

      this.logger.log(
        'Response status 204',
        `${ApplicationService.name}#updateCustomerDetails`,
        '',
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationService.name}#updateCustomerDetails`,
        '',
        error,
      );
      throw error;
    }
  }

  async generateRIC(
    screenTrackingId: string,
    userId: string,
    request: Request,
  ) {
    const ip: string = this.appService.getIPAddress(request);
    this.logger.log(
      'Generating RIC with params:',
      `${ApplicationService.name}#generateRIC`,
      request.id,
      { screenTrackingId, userId, ip },
    );
    const screenTracking: ScreenTracking | null =
      await this.screenTrackingModel.findOne({
        where: {
          id: screenTrackingId,
          user: userId,
        },
        relations: ['user', 'practiceManagement'],
      });

    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${ApplicationService.name}#generateRIC`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking not found.',
          request.id,
        ),
      );
    }

    const paymentManagement: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        screenTracking: screenTrackingId,
        user: userId,
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found',
        `${ApplicationService.name}#generateRIC`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Payment management not found.',
          request.id,
        ),
      );
    }

    const agreement: Agreement | null = await this.agreementModel.findOne({
      documentKey: '131',
    });
    if (!agreement) {
      this.logger.error(
        'Agreement not found',
        `${ApplicationService.name}#generateRIC`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, 'Agreement not found.', request.id),
      );
    }

    const ricData = await this.getPromissoryNoteData2(
      screenTracking.id,
      request,
    );
    const signature: ESignature | null = await this.esignatureModel.findOne({
      user: userId,
    });
    if (!signature) {
      this.logger.error(
        'Esignature not found',
        `${ApplicationService.name}#uploadRICPdf`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Esignature not found for user id ${userId}`,
          request.id,
        ),
      );
    }

    const signatureImage: PromiseResult<s3.GetObjectOutput, AWSError> =
      await this.s3Service.downloadFile(signature.signaturePath, request.id);
    const agreementDocumentPath = await this.userConsentService.uploadRICPdf(
      {
        ...ricData,
        signature: `data:image/png;base64,${signatureImage.Body.toString(
          'base64',
        )}`,
      },
      agreement,
      request,
    );

    /**
     * remove any previously created user consents
     * for ric (documentKey: 131)
     **/
    await this.userConsentModel.delete({
      documentKey: '131',
      user: userId,
    });

    /** create user consent for RIC **/
    const userConsent = {
      agreementDocumentPath,
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip: ip,
      signedAt: new Date(),
      user: screenTracking.user as User,
      agreement: agreement,
      loanUpdated: 1,
      screenTracking: screenTracking.id,
      paymentManagement: paymentManagement.id,
    };
    let newUserConsent = this.userConsentModel.create(userConsent);
    newUserConsent = await this.userConsentModel.save(newUserConsent);

    /** update e-signature with screen tracking id **/
    await this.esignatureModel.update(
      {
        user: screenTracking.user,
      },
      {
        consent: newUserConsent.id,
        screenTracking: screenTracking.id,
      },
    );
  }

  async getPromissoryNoteData2(screenTrackingId: string, request: Request) {
    this.logger.log(
      'Getting promissory note data 2 with params:',
      `${ApplicationService.name}#getPromissoryNoteData2`,
      request.id,
      { screenTrackingId },
    );
    const screenTracking: ScreenTracking | null =
      await this.screenTrackingModel.findOne({
        where: { id: screenTrackingId },
        relations: ['user', 'practiceManagement'],
      });

    if (!screenTracking) {
      this.logger.error(
        'Screen tracking id not found',
        `${ApplicationService.name}#getPromissoryNoteData2`,
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
    if (!screenTracking.user) {
      this.logger.error(
        'User for this screen tracking not found',
        `${ApplicationService.name}#getPromissoryNoteData2`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'User for this screen tracking not found.',
          request.id,
        ),
      );
    }

    const user: User = screenTracking.user as User;
    const practiceManagement: PracticeManagement =
      screenTracking.practiceManagement as PracticeManagement;
    const selectedOffer = screenTracking.offerData;
    if (!selectedOffer) {
      this.logger.error(
        'Screen tracking does not have a selected offer',
        `${ApplicationService.name}#getPromissoryNoteData2`,
        request.id,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          `Screen tracking id ${screenTrackingId} does not have a selected offer`,
          request.id,
        ),
      );
    }

    const ricAgreement: Agreement | null = await this.agreementModel.findOne({
      documentKey: '131',
    });
    if (!ricAgreement) {
      this.logger.error(
        'RIC agreement not found',
        `${ApplicationService.name}#getPromissoryNoteData2`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `RIC agreement not found for practice id ${practiceManagement.id}`,
          request.id,
        ),
      );
    }

    const ricSignature: ESignature = await this.esignatureModel.findOne({
      user: user.id,
    });
    if (ricSignature) {
      ricSignature.signaturePath = this.s3Service.getS3Url(
        ricSignature.signaturePath,
      );
    }

    const paymentSchedule: any[] =
      this.paymentManagementService.getLoanPaymentSchedule(
        screenTracking,
        true,
        request.id,
      );
    const response = {
      screenTracking: {
        applicationReference: screenTracking.applicationReference,
        approveUpTo: screenTracking.approvedUpTo,
        skipAutoPay: screenTracking.skipAutoPay,
      },
      paymentScheduleInfo: {
        lastPayment: {
          amount: paymentSchedule[paymentSchedule.length - 1].amount,
          due: moment(paymentSchedule[paymentSchedule.length - 1].date).format(
            'MM/DD/YYYY',
          ),
          numberOfPayments: 1,
        },
        regularPayments: {
          amount: paymentSchedule[0].amount,
          due: `${moment(paymentSchedule[0].date).format('Do')} of each month`,
          numberOfPayments: paymentSchedule.length,
        },
        totalPayments: {
          amount: paymentSchedule[0].amount,
          due: moment(paymentSchedule[0].date).format('MM/DD/YYYY'),
          numberOfPayments: paymentSchedule.length,
        },
      },
      provider: {
        practiceName: practiceManagement.location,
        streetAddress: practiceManagement.address,
        city: practiceManagement.city,
        stateCode: practiceManagement.stateCode,
        zipCode: practiceManagement.zip,
        phone: practiceManagement.phone,
      },
      selectedOffer: {
        ...selectedOffer,
        documentaryStampTax: 0,
        firstPaymentDate: moment().add(30, 'days').format('MM/DD/YYYY'),
        fundingDate: moment().format('MM/DD/YYYY'),
        paymentFrequency: 'monthly',
        salesTax: 0,
      },
      ricSignaturePath: ricSignature?.signaturePath,
      userData: {
        userReference: user.userReference,
        fullName: `${user.firstName} ${user.lastName}`,
        street: user.street,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        ip: this.appService.getIPAddress(request),
      },
      date: moment().format('MM/DD/YYYY'),
    };

    return response;
  }

  async connectUserConsentsToPM(
    screenTrackingId: string,
    userId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Connecting user consents to PM with params:',
      `${ApplicationService.name}#connectUserConsentsToPM`,
      requestId,
      { screenTrackingId, userId },
    );

    const screenTracking = await this.screenTrackingModel.findOne({
      where: {
        id: screenTrackingId,
        user: userId,
      },
      relations: ['user', 'practiceManagement'],
    });

    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${ApplicationService.name}#connectUserConsentsToPM`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking not found',
          requestId,
        ),
      );
    }

    const paymentManagement: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        screenTracking: screenTrackingId,
        user: userId,
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found',
        `${ApplicationService.name}#connectUserConsentsToPM`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Payment management not found.',
          requestId,
        ),
      );
    }

    const userConsents: UserConsent[] = await this.userConsentModel.find({
      where: {
        paymentManagement: null,
        screenTracking: screenTrackingId,
        user: userId,
      },
    });

    if (userConsents.length) {
      await this.userConsentModel.update(
        {
          screenTracking: screenTrackingId,
          user: userId,
        },
        { paymentManagement: paymentManagement.id },
      );
      //welcomeEmail('');
    }
  }

  async updateContractorApplicationLastStep(
    screenTrackingId: string,
    lastLevel: string,
    requestId: string,
  ) {
    let obj;
    switch (lastLevel.length > 0) {
      case true:
        obj = {
          lastLevel: lastLevel,
        };
        break;
      default:
        obj = {
          lastLevel: 'apply',
        };
        break;
    }
    const screenTracking = await this.screenTrackingModel.update(
      { id: screenTrackingId },
      obj,
    );
    if (!screenTracking) {
      this.logger.log(
        'screenTracking not found',
        `${ApplicationService.name}#updateContractorApplicationLastStep`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `screenTrackingId  not found for screenTrackingId id ${screenTrackingId}`,
          requestId,
        ),
      );
    }
    return screenTracking;
  }

  async underwriteContractor(
    screenTracking: ScreenTracking,
    user: User,
    requestId: string,
  ) {
    const creditReport = await this.experianService.creditReportInquiry(
      screenTracking,
      user,
      requestId,
    );

    const stage1Rules = await this.productService.getContractorStage1Rules(
      user,
      screenTracking,
      creditReport,
      requestId,
    );
    const rulesDetails = {
      approvedRuleMsg: [...stage1Rules.approvedRuleMsg],
      declinedRuleMsg: [...stage1Rules.declinedRuleMsg],
      ruleData: {
        ...stage1Rules.ruleData,
      },
      loanApproved: stage1Rules.loanApproved,
    };

    const screenUpdateObj: any = {
      creditScore: creditReport.score || 0,
      lastScreen: rulesDetails.loanApproved
        ? 'address-information'
        : 'declined',
      rulesDetails: rulesDetails,
    };

    await this.screenTrackingModel.update(
      { id: screenTracking.id },
      screenUpdateObj,
    );

    await this.paymentManagementService.createPaymentManagement(
      screenTracking,
      rulesDetails.loanApproved ? 'pending' : 'denied',
      requestId,
    );
    return rulesDetails;
  }

  async underwriteBorrower(
    screenTracking: ScreenTracking,
    user: User,
    requestId: string,
  ) {
    const creditReport = await this.experianService.creditReportInquiry(
      screenTracking,
      user,
      requestId,
    );

    const stage1Rules = await this.productService.getBorrowerStage1Rules(
      user,
      screenTracking,
      creditReport,
      requestId,
    );
    const rulesDetails = {
      approvedRuleMsg: [...stage1Rules.approvedRuleMsg],
      declinedRuleMsg: [...stage1Rules.declinedRuleMsg],
      ruleData: {
        ...stage1Rules.ruleData,
      },
      loanApproved: stage1Rules.loanApproved,
      isPending: stage1Rules.isPending,
    };
    let applicationStatus: 'approved' | 'pending' | 'denied' | 'qualified' = "approved";
    let screenUpdateObj: any = {
      creditScore: creditReport.score || 0,
      lastLevel: rulesDetails.loanApproved && !rulesDetails.isPending ? 'apply' : 'denied', // TODO: If it's denied we need to update the laststep since seems not been updated
      rulesDetails: rulesDetails,
    };
    if (rulesDetails.isPending) {
      screenUpdateObj.lastLevel = 'apply';
      applicationStatus = 'pending';
    }
    try {
      await this.screenTrackingModel.update(
        { id: screenTracking.id },
        screenUpdateObj,
      );
      } catch (e) {
      console.log("Error updating object", e);
    }

    await this.paymentManagementService.createPaymentManagement(
      screenTracking,
      rulesDetails.loanApproved ? applicationStatus : 'denied',
      requestId,
    );
    return rulesDetails;
  }

  async updateBusinessData(
    screenTrackingId: string,
    data: any,
    requestId: string,
  ) {
    const screenTracking: any = await this.screenTrackingModel.findOne({
      where: {
        id: screenTrackingId,
      },
      relations: ['practiceManagement', 'user'],
    });
    if (!screenTracking) {
      this.logger.log(
        'screenTracking not found',
        `${ApplicationService.name}#updateContractorApplicationLastStep`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `screenTrackingId  not found for screenTrackingId id ${screenTrackingId}`,
          requestId,
        ),
      );
    }
    const obj = {
      stateCode: data.state || '',
      address: data.street || '',
      city: data.city || '',
      email: data.email || '',
      phone: data.phone || '',
      url: data.website || '',
      practiceName: data.name || '',
      zip: data.zip || '',
      yearsInBusiness: data.yearsInBusiness || '',
      tin: data.tin || '',
      contactName:
        screenTracking.user.firstName + ' ' + screenTracking.user.lastName,
    };
    await this.practiceManagementModel.update(
      { id: screenTracking?.practiceManagement?.id },
      obj,
    );
    const updatedPracticeManagement =
      await this.practiceManagementModel.findOne({
        id: screenTracking?.practiceManagement?.id,
      });
    const middeskReport = await this.middeskService.getReport(
      updatedPracticeManagement,
    );
    await this.middeskService.create({
      screenTrackingId,
      report: middeskReport,
    });
    const midDesk = await this.middeskService.findByLoanId(screenTrackingId);
    const stage2Results = await this.productService.getContractorStage2Rules(
      screenTracking,
      updatedPracticeManagement,
      midDesk,
      requestId,
    );

    const rulesDetails = {
      approvedRuleMsg: [
        screenTracking.rulesDetails.approvedRuleMsg,
        ...stage2Results.approvedRuleMsg,
      ],
      declinedRuleMsg: [
        screenTracking.rulesDetails.declinedRuleMsg,
        ...stage2Results.declinedRuleMsg,
      ],
      ruleData: {
        ...screenTracking.rulesDetails.ruleData,
        ...stage2Results.ruleData,
      },
      // ...stage1Rules.ruleApprovals,
      // ...stage2Rules.ruleApprovals,
      loanApproved: stage2Results.loanApproved,
    };

    await this.screenTrackingModel.update(
      { id: screenTrackingId },
      {
        lastScreen: rulesDetails.loanApproved ? 'document-upload' : 'declined',
        rulesDetails: rulesDetails,
      },
    );
    return updatedPracticeManagement;
  }

  async getPracticeManagementByScreenTrackingId(
    screenTrackingId: string,
    requestId: string,
  ) {
    const screenTracking: any = await this.screenTrackingModel.findOne({
      where: {
        id: screenTrackingId,
      },
      relations: ['practiceManagement'],
    });
    if (!screenTracking) {
      this.logger.log(
        'screenTracking not found',
        `${ApplicationService.name}#updateContractorApplicationLastStep`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `screenTrackingId  not found for screenTrackingId id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    return screenTracking.practiceManagement;
  }
}
