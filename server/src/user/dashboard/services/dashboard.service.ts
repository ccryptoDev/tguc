import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import moment from 'moment';

import { PaymentManagement } from '../../../loans/payments/payment-management/payment-management.entity';
import { LoggerService } from '../../../logger/services/logger.service';
import { UserDocuments } from '../../documents/entities/documents.entity';
import { User } from '../../entities/user.entity';
import { UserConsent } from '../../consent/entities/consent.entity';
import { AppService } from '../../../app.service';
import { LedgerService } from '../../../loans/ledger/services/ledger.service';
import { LoanpaymentproService } from '../../../loans/payments/loanpaymentpro/loanpaymentpro.service';
import { PaymentService } from '../../../loans/payments/services/payment.service';
import { ChangePaymentAmountDto } from '../../../admin/dashboard/dtos/change-payment-amount.dto';
import { ScreenTracking } from 'src/user/screen-tracking/entities/screen-tracking.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserDocuments)
    private readonly userDocumentsModel: Repository<UserDocuments>,
    @InjectRepository(PaymentManagement)
    private readonly paymentManagementModel: Repository<PaymentManagement>,
    @InjectRepository(UserConsent)
    private readonly userConsentModel: Repository<UserConsent>,
    private readonly ledgerService: LedgerService,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly paymentService: PaymentService,
  ) {}

  async getDashboard(userId: string, requestId: string) {
    this.logger.log(
      'Getting user dashboard with params:',
      `${DashboardService.name}#getDashboard`,
      requestId,
      { userId },
    );
    const userDocuments: UserDocuments | null =
      await this.userDocumentsModel.findOne({
        where: {
          user: userId,
        },
        relations: ['user'],
      });

    if (!userDocuments) {
      this.logger.error(
        "User's documents not found",
        `${DashboardService.name}#getDashboard`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Documents not found for user id ${userId}`,
          requestId,
        ),
      );
    }
    if (!userDocuments.user) {
      this.logger.error(
        'User not found',
        `${DashboardService.name}#getDashboard`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `User id ${userId} not found`,
          requestId,
        ),
      );
    }

    const userDocuments1: UserDocuments[] | null =
      await this.userDocumentsModel.find({
        user: userId,
      });

    this.logger.log(
      'Got user dashboard:',
      `${DashboardService.name}#userDocuments`,
      requestId,
      userDocuments1,
    );

    // user documents
    const documents: any = {};
    if (userDocuments.passport) {
      documents.passportPath = userDocuments.passport;
    } else if (userDocuments.driversLicense) {
      documents.driversLicensePaths = userDocuments.driversLicense;
    } else {
      this.logger.error(
        `User's document path not found`,
        `${DashboardService.name}#getDashboard`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `User's documents not found`,
          requestId,
        ),
      );
    }
    documents.userDocuments = userDocuments1;

    const user: User = userDocuments.user as User;
    const { firstName, lastName, street, unitApt, city, state, zipCode } = user;
    const name = `${firstName} ${lastName}`;
    const address = `${street} ${unitApt} ${city} ${state} ${zipCode}`;

    const paymentManagement: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        where: {
          user: userId,
        },
        relations: ['screenTracking'],
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found',
        `${DashboardService.name}#getDashboard`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Payment management not found for this user',
          requestId,
        ),
      );
    }

    const paymentManagementData: PaymentManagement =
      await this.checkPromoAvailability(paymentManagement, requestId);
    // const ledger = this.ledgerService.getPaymentLedger(
    //   paymentManagementData,
    //   moment().startOf('day').toDate(),
    //   requestId,
    // );
    // paymentManagementData.payOffAmount = ledger.payoff;

    // const userConsents: UserConsent[] | null = await this.userConsentModel.find(
    //   { user: userId },
    // );
    // if (!userConsents || userConsents.length <= 0) {
    //   this.logger.error(
    //     'User consents not found',
    //     `${DashboardService.name}#getDashboard`,
    //     requestId,
    //   );
    //   throw new NotFoundException(
    //     this.appService.errorHandler(
    //       404,
    //       'No consents found for this user',
    //       requestId,
    //     ),
    //   );
    // }

    // let smsPolicyPath = '';
    // let esignaturePath = '';
    // let ricPath = '';
    // const eftaConsents = [];
    // userConsents.forEach((consent) => {
    //   if (consent.agreementDocumentPath && consent.documentKey == '126') {
    //     smsPolicyPath = consent.agreementDocumentPath;
    //   } else if (
    //     consent.agreementDocumentPath &&
    //     consent.documentKey === '120'
    //   ) {
    //     esignaturePath = consent.agreementDocumentPath;
    //   } else if (
    //     consent.agreementDocumentPath &&
    //     consent.documentKey === '131'
    //   ) {
    //     ricPath = consent.agreementDocumentPath;
    //   } else if (
    //     consent.agreementDocumentPath &&
    //     consent.documentKey === '132'
    //   ) {
    //     eftaConsents.push(consent);
    //   }
    // });

    // const userAccountsData = await this.loanPaymentProService.getUserCards(
    //   (paymentManagementData.screenTracking as ScreenTracking).id,
    //   requestId,
    // );

    this.logger.log(
      'Got user dashboard:NEW',
      `${DashboardService.name}#documents`,
      requestId,
      documents,
    );

    const response = {
      name,
      address,
      phone: user.phones[0],
      email: user.email,
      // smsPolicyPath,
      // esignaturePath,
      // ricPath,
      // eftaConsents,
      paymentManagementData,
      // userAccountsData,
      ...documents,
    };
    this.logger.log(
      'Got user dashboard:',
      `${DashboardService.name}#getDashboard`,
      requestId,
      response,
    );

    return response;
  }

  async checkPromoAvailability(
    paymentManagement: PaymentManagement,
    requestId: string,
  ): Promise<PaymentManagement> {
    this.logger.log(
      `Checking promo availability for payment management id ${paymentManagement.id}`,
      `${DashboardService.name}#checkPromoAvailability`,
      requestId,
    );
    if (paymentManagement.promoStatus === 'unavailable') {
      this.logger.log(
        'Promo is unavailable',
        `${DashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    } else if (
      moment()
        .startOf('day')
        .isAfter(
          moment(paymentManagement.loanStartDate)
            .add(paymentManagement.promoTermCount, 'months')
            .startOf('day'),
        )
    ) {
      this.logger.log(
        'Setting promoStatus to unavailable',
        `${DashboardService.name}#checkPromoAvailability`,
        requestId,
      );
      await this.paymentManagementModel.update(
        { id: paymentManagement.id },
        { promoStatus: 'unavailable' },
      );
      this.logger.log(
        'promoStatus set to unavailable',
        `${DashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    } else {
      this.logger.log(
        'Promo is still available',
        `${DashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    }

    return paymentManagement;
  }
  async changeMonthlyPaymentAmount(
    changePaymentAmountDto: ChangePaymentAmountDto,
    requestId: string,
  ) {
    const { screenTracking, amount } = changePaymentAmountDto;
    const paymentManagement: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${DashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTracking}`,
          requestId,
        ),
      );
    }

    const { minimumPaymentAmount, payOffAmount } = paymentManagement;
    if (amount < minimumPaymentAmount || amount > payOffAmount) {
      this.logger.error(
        `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
        `${DashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
          requestId,
        ),
      );
    }

    const newPaymentSchedule = this.paymentService.amortizeSchedule(
      amount,
      paymentManagement,
      requestId,
    );

    await this.paymentManagementModel.update(paymentManagement.id, {
      currentPaymentAmount: amount,
      paymentSchedule: newPaymentSchedule,
    });
  }

  async enableAutopay(paymentManagementId: string) {
    await this.paymentService.triggerAutoPay(paymentManagementId, true);
  }
}
