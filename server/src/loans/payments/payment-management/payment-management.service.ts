import { Injectable, NotFoundException } from '@nestjs/common';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { PaymentManagement } from './payment-management.entity';
import { UserConsent } from '../../../user/consent/entities/consent.entity';
import { MathExtService } from '../../mathext/services/mathext.service';
import { CountersService } from '../../../counters/services/counters.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { IPaymentScheduleItem } from './payment-schedule-item.interface';
import { AppService } from '../../../app.service';
import { DenyDto } from '../../application/validation/deny.dto';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { SendGridService } from '../../../email/services/sendgrid.service';
import { User } from '../../../user/entities/user.entity';
import Config from '../../../app.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentManagementService {
  constructor(
    @InjectRepository(PaymentManagement)
    private readonly paymentManagementModel: Repository<PaymentManagement>,
    @InjectRepository(UserConsent)
    private readonly userConsentModel: Repository<UserConsent>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly mathExtService: MathExtService,
    private readonly countersService: CountersService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly nunjucksService: NunjucksService,
    private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
  ) { }

  async createLoanPaymentSchedule(
    screenTracking: ScreenTracking,
    requestId: string,
  ) {
    const { offerData } = screenTracking;
    const approvedAmount = offerData.financedAmount + offerData.downPayment;
    const promoSelected = offerData.promoSelected;
    const apr = promoSelected ? offerData.promoApr : offerData.apr;
    const maturityDate = promoSelected
      ? moment().startOf('day').add(offerData.promoTerm, 'months').toDate()
      : moment().startOf('day').add(offerData.term, 'months').toDate();
    const paymentSchedule: any[] = this.getLoanPaymentSchedule(
      screenTracking,
      false,
      requestId,
    );
    const loanReferenceData = await this.countersService.getNextSequenceValue(
      'loan',
      requestId,
    );

    const paymentManagementObject: Partial<PaymentManagement> = {
      apr,
      canRunAutomaticPayment: !screenTracking.skipAutoPay,
      currentPaymentAmount: offerData.promoSelected
        ? offerData.promoMonthlyPayment
        : offerData.monthlyPayment,
      initialPaymentSchedule: paymentSchedule,
      interestApplied: offerData.interestRate,
      loanReference: `LN_${loanReferenceData.sequenceValue}`,
      loanStartDate: moment().startOf('day').toDate(),
      loanTermCount: offerData.term,
      maturityDate: maturityDate,
      minimumPaymentAmount: offerData.monthlyPayment,
      nextPaymentSchedule: moment().add(1, 'months').startOf('day').toDate(),
      paymentSchedule,
      payOffAmount: approvedAmount,
      practiceManagement: screenTracking.practiceManagement,
      principalAmount: approvedAmount,
      promoPaymentAmount: offerData.promoMonthlyPayment,
      promoSelected,
      promoStatus: 'available',
      promoTermCount: offerData.promoTerm,
      screenTracking: screenTracking.id,
      status: 'in-repayment prime',
      user: screenTracking.user,
    };
    this.logger.log(
      'Creating payment schedule with params:',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      paymentManagementObject,
    );

    const paymentManagement = await this.paymentManagementModel.findOne({
      where: { screenTracking: screenTracking.id },
    });
    await this.paymentManagementModel.update(
      { screenTracking: screenTracking.id },
      paymentManagementObject,
    );

    this.logger.log(
      'Payment schedule created',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      paymentManagement,
    );

    this.logger.log(
      'Saving original payment schedule with params:',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      paymentManagementObject,
    );

    this.logger.log(
      'Original payment schedule saved',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      paymentManagement,
    );

    const updateConsentAgreementCriteria = {
      user: screenTracking.user,
      loanUpdated: 1,
      paymentManagement: null,
    };
    this.logger.log(
      'Updating user consent agreement with params:',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      updateConsentAgreementCriteria,
    );
    const userConsentAgreements: UpdateResult =
      await this.userConsentModel.update(updateConsentAgreementCriteria, {
        paymentManagement: paymentManagement.id,
      });

    this.logger.log(
      'User consent agreements updated:',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      userConsentAgreements,
    );

    return paymentManagement;
  }

  getLoanPaymentSchedule(
    screenTracking: ScreenTracking,
    forRIC = false,
    requestId: string,
  ): IPaymentScheduleItem[] {
    this.logger.log(
      'Creating payment schedule with params:',
      `${PaymentManagementService.name}#getLoanPaymentSchedule`,
      requestId,
      { screenTracking, forRIC },
    );
    const selectedOffer = screenTracking.offerData;
    const approvedAmount = selectedOffer.financedAmount;
    let loanInterestRate = selectedOffer.promoSelected
      ? selectedOffer.promoInterestRate
      : selectedOffer.interestRate;
    let monthlyPayment = selectedOffer.promoSelected
      ? selectedOffer.promoMonthlyPayment
      : selectedOffer.monthlyPayment;
    let loanTerm = selectedOffer.promoSelected
      ? selectedOffer.promoTerm
      : selectedOffer.term;
    if (forRIC) {
      loanInterestRate = selectedOffer.interestRate;
      monthlyPayment = selectedOffer.monthlyPayment;
      loanTerm = selectedOffer.term;
    }

    const paymentSchedule: IPaymentScheduleItem[] = [];
    const amortizationSchedule = this.mathExtService.makeAmortizationSchedule(
      approvedAmount,
      monthlyPayment,
      loanInterestRate,
      loanTerm,
      requestId,
    );
    amortizationSchedule.schedule.forEach((item) => {
      paymentSchedule.push({
        amount: item.payment,
        date: moment().startOf('day').add(item.id, 'months').toDate(),
        endPrincipal: item.endBalance,
        fees: 0,
        interest: item.interest,
        month: item.id,
        paidFees: 0,
        paidInterest: 0,
        paidPastDueInterest: 0,
        paidPrincipal: 0,
        pastDueInterest: 0,
        payment: 0,
        paymentType: 'automatic',
        principal: item.principal,
        startPrincipal: item.startBalance,
        status: 'opened',
        transactionId: nanoid(10),
      });
    });
    this.logger.log(
      'Payment schedule created:',
      `${PaymentManagementService.name}#getLoanPaymentSchedule`,
      requestId,
      paymentSchedule,
    );

    return paymentSchedule;
  }

  async createPaymentManagement(
    screenTracking: ScreenTracking,
    status: 'approved' | 'pending' | 'denied' | 'qualified',
    requestId: string,
  ) {
    const existingPaymentManagement = await this.paymentManagementModel.findOne(
      {
        where: { screenTracking: screenTracking.id },
        relations: ['practiceManagement'],
      },
    );
    if (existingPaymentManagement) {
      return;
    }

    const paymentObj: Partial<PaymentManagement> = {
      practiceManagement: screenTracking.practiceManagement,
      screenTracking: screenTracking.id,
      status,
      user: screenTracking.user,
    };
    this.logger.log(
      'Creating payment Management with params:',
      `${PaymentManagementService.name}#createPaymentManagement`,
      requestId,
      paymentObj,
    );
    const paymentManagement = this.paymentManagementModel.create(paymentObj);
    return await this.paymentManagementModel.save(paymentManagement);
  }

  async setInRepaymentNonPrimeStatus(userId: string, requestId: string) {
    const screenTrackingDocument = await this.screenTrackingModel.findOne({
      user: userId,
    });
    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking for user id: ${userId}`;
      this.logger.error(
        errorMessage,
        `${PaymentManagementService.name}#setInRepaymentStatus`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const { offerData } = screenTrackingDocument;
    if (!offerData.downPayment || offerData.downPayment <= 0) {
      return;
    }

    await this.paymentManagementModel.update(
      {
        screenTracking: screenTrackingDocument.id,
      },
      { status: 'in-repayment non-prime' },
    );
  }

  async approveApplication(screenTrackingId: string, requestId: string) {
    let paymentManagement = await this.paymentManagementModel.findOne({
      where: {
        screenTracking: screenTrackingId,
      },
      relations: ['user'],
    });
    if (!paymentManagement) {
      throw new NotFoundException(
        `Application with screenTrackingId #${screenTrackingId} not found`,
      );
    }
    paymentManagement.status = 'approved';
    paymentManagement = await this.paymentManagementModel.save(
      paymentManagement,
    );
    if (paymentManagement.user instanceof User) {
      // Send approved email to borrower
      const html: string = await this.nunjucksService.htmlToString(
        'emails/application-approved-borrower.html',
        {
          name: `${paymentManagement?.user?.firstName} ${paymentManagement?.user?.lastName}`,
          amount: paymentManagement?.principalAmount,
          baseUrl: Config().baseUrl,
        },
      );
      const applicationNumber = paymentManagement?.user?.userReference.replace(
        'USR_',
        '',
      );
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        paymentManagement?.user?.email,
        `Congratulations! TGUC credit application #${applicationNumber} is approved!`,
        html,
        requestId,
      );
    }
    return paymentManagement;
  }

  async denyApplication(
    screenTrackingId: string,
    denyApplicationDto: DenyDto,
    requestId: string,
  ) {
    let paymentManagement = await this.paymentManagementModel.findOne({
      where: {
        screenTracking: screenTrackingId,
      },
      relations: ['user'],
    });
    if (!paymentManagement) {
      throw new NotFoundException(
        `Application with screenTrackingId #${screenTrackingId} not found`,
      );
    }
    paymentManagement.status = 'denied';
    paymentManagement = await this.paymentManagementModel.save(
      paymentManagement,
    );
    const reasons = denyApplicationDto.reasonOptions;
    const index = reasons.indexOf('Other');
    if (index !== -1) {
      reasons.splice(index, 1, denyApplicationDto.reasonValue);
    }
    const denyReasons: Record<string, any>[] = [
      {
        reasons: reasons,
      },
    ];
    const screenTracking = await this.screenTrackingModel.findOne({
      id: screenTrackingId,
    });
    if (screenTracking) {
      screenTracking.declineReasons = denyReasons;
      await this.screenTrackingModel.save(screenTracking);
    }

    if (paymentManagement.user instanceof User) {
      const formattedReasons = '<p style="margin:0;padding:2px 0;">' + reasons.join('</p><p style="margin:0;padding:2px 0;">') + '</p>';
      // Send denial email to borrower
      const html: string = await this.nunjucksService.htmlToString(
        'emails/application-denied-borrower.html',
        {
          name: `${paymentManagement?.user?.firstName} ${paymentManagement?.user?.lastName}`,
          baseUrl: Config().baseUrl,
          reasons: formattedReasons
        },
      );
      const applicationNumber = paymentManagement?.user?.userReference.replace(
        'USR_',
        '',
      );
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        paymentManagement?.user?.email,
        `TGUC Credit Application #${applicationNumber} update`,
        html,
        requestId,
      );
    }
    return paymentManagement;
  }
}
