import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import moment from 'moment';
import { nanoid } from 'nanoid';

import { LoggerService } from '../../../logger/services/logger.service';
import { Counters } from '../../../counters/entities/counters.entity';
import { CountersService } from '../../../counters/services/counters.service';
import { User } from '../../../user/entities/user.entity';

import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { LoanpaymentproService } from '../loanpaymentpro/loanpaymentpro.service';
import { PaymentManagement } from '../payment-management/payment-management.entity';
import { Payment } from '../entities/payment.entity';
import { SubmitPaymentDto } from '../../../admin/dashboard/dtos/submit-payment.dto';
import { LedgerService } from '../../ledger/services/ledger.service';
import { AppService } from '../../../app.service';
import { MakePaymentDialogDto } from '../../../admin/dashboard/dtos/makePaymentDialog.dto';
import { IPaymentScheduleItem } from '../payment-management/payment-schedule-item.interface';
import { ILedger } from '../../ledger/interfaces/ledger.interface';
import crypto from 'crypto';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { LoanPaymentProCardSale } from '../loanpaymentpro/loanpaymentpro-card-sale.entity';
import { LoanPaymentProCardToken } from '../loanpaymentpro/loanpaymentpro-card-token.entity';
import { SendGridService } from '../../../email/services/sendgrid.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { ConfigService } from '@nestjs/config';
import { IPaymentScheduleStatusItem } from '../payment-management/payment-schedule-transactionstatus.interface';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentModel: Repository<Payment>,
    @InjectRepository(PaymentManagement)
    private readonly paymentManagementModel: Repository<PaymentManagement>,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly countersService: CountersService,
    private readonly ledgerService: LedgerService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(LoanPaymentProCardSale)
    private readonly loanPaymentProCardSaleModel: Repository<LoanPaymentProCardSale>,
    private readonly mailService: SendGridService,
    private readonly nunjucksService: NunjucksService,
    private readonly configService: ConfigService,
    @InjectRepository(LoanPaymentProCardToken)
    private readonly loanPaymentProCardTokenModel: Repository<LoanPaymentProCardToken>,
  ) { }

  async refundPaymentData(request: any, token: string) {
    this.logger.log(
      `Refund customer payment`,
      `${PaymentService.name}#refundPaymentData`,
      request.id,
    );

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const findUser = await this.userModel.findOne({
      where: {
        customerUpdateToken: hashedToken,
        customerUpdateTokenExpires: MoreThan(new Date()),
      },
    });

    if (!findUser) {
      const errorMessage = 'Invalid user';
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#refundPaymentData`,
        request.id,
      );

      throw new UnauthorizedException();
    }

    const updateUserResponse = await this.userModel.update(
      {
        customerUpdateToken: hashedToken,
        customerUpdateTokenExpires: MoreThan(new Date()),
      },
      {
        customerUpdateToken: null,
        customerUpdateTokenExpires: null,
      },
    );

    if (updateUserResponse.affected < 1) {
      const errorMessage = `Invalid token`;
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#refundPaymentData`,
        request.id,
        token,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, request.id),
      );
    }
    this.logger.log(
      `Refund Update Token`,
      `${PaymentService.name} #refundPaymentData`,
      request.id,
    );

    const findscreenTracking: ScreenTracking =
      await this.screenTrackingModel.findOne({
        user: findUser.id,
      });
    // Updated Loan Status to Closed
    const paymentManagement: PaymentManagement =
      await this.paymentManagementModel.findOne({
        screenTracking: findscreenTracking.id,
      });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${PaymentService.name}#getPaymentSchedule`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Refund Payment management not found for user id ${findscreenTracking.id}`,
          request.id,
        ),
      );
    }

    const updatepaymentManagementModel =
      await this.paymentManagementModel.update(
        { screenTracking: findscreenTracking.id },
        {
          status: 'closed',
          canRunAutomaticPayment: false,
        },
      );

    if (updatepaymentManagementModel.affected < 1) {
      const errorMessage = `Invalid token`;
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#refundPaymentData`,
        request.id,
        token,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, request.id),
      );
    }
    // Updated Loan Status to Closed

    // Refund Process initiated

    const paidTransaction = await this.loanPaymentProCardSaleModel.find({
      user: findUser.id,
      status: 'Success',
    });

    paidTransaction.forEach(async (transaction) => {
      const refundStatus =
        (await this.loanPaymentProService.v21PaymentsRefundCard(
          transaction.transactionId,
          transaction.paymentRequest.invoiceId,
          String(transaction.paymentRequest.amount),
          request.id,
        )) as unknown as Record<string, any>;
      if (refundStatus.ResponseCode == '29') {
        const { paymentSchedule } = paymentManagement;
        const scheduleItemIndex: number = paymentSchedule.findIndex(
          (item) =>
            item.paymentReference === transaction.paymentRequest.invoiceId,
        );
        if (scheduleItemIndex !== -1) {
          paymentSchedule[scheduleItemIndex].isRefund = true;
          paymentSchedule[scheduleItemIndex].refundAmount =
            transaction.paymentRequest.amount;
          paymentSchedule[scheduleItemIndex].refundDate = new Date();
          await this.paymentManagementModel.save(paymentManagement);
        }
      }
    });
  }

  async partialReturnData(request: any, email: string, amount: number) {
    this.logger.log(
      `partialReturnData customer payment`,
      `${PaymentService.name}#partialReturnData`,
      request.id,
    );

    const findUser = await this.userModel.findOne({
      email: email,
    });

    if (!findUser) {
      const errorMessage = 'Invalid user';
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#partialReturnData`,
        request.id,
      );

      throw new UnauthorizedException();
    }

    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: findUser.id,
    });
    // Updated Loan Status to Closed
    const paymentManagement = await this.paymentManagementModel.findOne({
      screenTracking: findscreenTracking.id,
    });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${PaymentService.name}#partialReturnData`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Refund Payment management not found for user id ${findscreenTracking.id}`,
          request.id,
        ),
      );
    }

    const user = paymentManagement.user as User;
    let cardToken = await this.loanPaymentProCardTokenModel.findOne({
      user,
      isDefault: true,
    });

    if (!cardToken) {
      cardToken = await this.loanPaymentProCardTokenModel.findOne({
        user,
      });
      if (!cardToken) {
        this.logger.error(
          `Payment method token for user id ${user.id} not found`,
          `${PaymentService.name}#makeAutomaticPayment`,
        );
      }
    }

    const refundStatus = await this.loanPaymentProService.v21PaymentsReturnRun(
      findUser.id,
      cardToken.paymentMethodToken,
      amount,
      request.id,
    );

    if (refundStatus == 200) {
    }
  }

  async paymentSuccess(
    user: User,
    sTracking: ScreenTracking,
    paymentDoc: Payment,
    location: string,
  ) {
    try {
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-paymentsuccess.html',
        {
          userName: `${user.firstName} ${user.lastName}`,
          amount: paymentDoc.amount,
          location: location,
          link: `${baseUrl}/login`,
        },
      );
      const subject = 'Thank You For Your Payment!';
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      const from = `${fromName} <${fromEmail}>`;
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, '');

      this.logger.log(
        'Response status 204',
        `${PaymentService.name}#updateCustomerDetails`,
        '',
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentService.name}#updateCustomerDetails`,
        '',
        error,
      );
      throw error;
    }
  }

  async paymentFailure(user: User, amount: number, message: string) {
    try {
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-paymentfailure.html',
        {
          userName: `${user.firstName} ${user.lastName}`,
          amount: amount,
          link: `${baseUrl}/login`,
          message: message,
        },
      );
      const subject = 'Alchemy Pay - Payment Not Processed';
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      const from = `${fromName} <${fromEmail}>`;
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, '');

      this.logger.log(
        'Response status 204',
        `${PaymentService.name}#paymentFailure`,
        '',
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentService.name}#paymentFailure`,
        '',
        error,
      );
      throw error;
    }
  }

  async makePayment(
    paymentManagement: PaymentManagement,
    paymentMethodToken: string,
    amount: number,
    requestId?: string,
  ) {
    const paymentNextValue: Counters =
      await this.countersService.getNextSequenceValue('payment', requestId);
    const practiceManagement =
      paymentManagement.practiceManagement as PracticeManagement;
    const user = paymentManagement.user as User;
    const findUser = await this.userModel.findOne({
      id: user.id,
    });
    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: user.id,
    });

    const paymentObj: {
      amount: number;
      paymentReference: string;
      paymentManagement: string;
      practiceManagement: string;
      status: 'pending' | 'paid' | 'declined';
      user: string;
      type: 'debit card';
      vendor: 'loanpaymentpro';
    } = {
      amount,
      paymentReference: `PMT_${paymentNextValue.sequenceValue}`,
      paymentManagement: paymentManagement.id,
      practiceManagement: practiceManagement.id,
      status: 'pending',
      user: user.id,
      type: 'debit card',
      vendor: 'loanpaymentpro',
    };

    const payment = await this.paymentModel.save(paymentObj);
    let cardSale: LoanPaymentProCardSale;
    try {
      cardSale = await this.loanPaymentProService.v21PaymentsPaymentCardsRun(
        user.id,
        paymentMethodToken,
        payment,
        requestId,
      );
      payment.transactionMessage = cardSale.message;
      payment.transId = cardSale.transactionId;
      payment.status = 'paid';
      await this.paymentModel.save(payment);

      //this.welcomeEmail(findUser, findscreenTracking, paymentManagement);
      this.paymentSuccess(
        findUser,
        findscreenTracking,
        payment,
        practiceManagement.location,
      );
      //Payment transaction success email
    } catch (error) {
      this.logger.log(
        'Payment error: ',
        `${PaymentService.name}#makePayment`,
        requestId,
        error,
      );

      this.paymentFailure(findUser, amount, error.message);
      payment.status = 'declined';
      throw error;
    }

    return payment;
  }

  async makeDownPayment(
    user: string,
    screenTracking: string,
    amount: number,
    paymentMethodToken: string,
    requestId: string,
  ) {
    this.logger.log(
      'Making down payment with params:',
      `${PaymentService.name}#makeDownPayment`,
      requestId,
      { user, screenTracking, amount, paymentMethodToken },
    );
    const paymentManagement: PaymentManagement =
      await this.paymentManagementModel.findOne({
        user,
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found.',
        `${PaymentService.name}#makeDownPayment`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user ${user}`,
          requestId,
        ),
      );
    }

    if (paymentManagement.paymentSchedule[0].status === 'paid') {
      this.logger.error(
        'Down payment already made',
        `${PaymentService.name}#makeDownPayment`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(403, 'Payment already made', requestId),
      );
    }

    await this.submitPayment(
      { paymentMethodToken, amount, paymentDate: new Date(), screenTracking },
      requestId,
    );
  }
  num = 0;
  previewPayment(
    paymentManagement: PaymentManagement,
    paymentAmount: number,
    paymentDate: Date,
    requestId: string,
  ) {
    // const paymentDate: Date = moment().startOf('day').toDate();
    const {
      paymentSchedule,
      currentPaymentAmount,
      promoPaymentAmount,
      promoStatus,
    } = paymentManagement;
    const isPromoAmount = false;
    // currentPaymentAmount >= promoPaymentAmount && promoStatus === 'available'
    //   ? true
    //   : false;
    const ledger: ILedger = this.ledgerService.getPaymentLedger(
      paymentManagement,
      paymentDate,
      requestId,
    );

    const today = moment().startOf('day').toDate();
    this.num = 0;
    paymentSchedule.forEach((scheduleItem) => {
      const isPastDue =
        moment(scheduleItem.date).isSameOrAfter(
          moment(today).startOf('day'),
          'day',
        ) && scheduleItem.status === 'opened';
      const isPastDue1 =
        moment(ledger.ledgerDate).isAfter(
          moment(scheduleItem.date).startOf('day'),
          'day',
        ) && scheduleItem.status === 'opened';

      const isPastDue2 =
        moment(scheduleItem.date).isBefore(
          moment(today).startOf('day'),
          'day',
        ) && scheduleItem.status === 'opened';

      if (!isPastDue && scheduleItem.status != 'failed' && isPastDue2) {
        this.num = this.num + 1;
      }
      if (isPastDue1 && isPastDue) {
        if (this.num == 0) {
          ledger.principalBalance =
            ledger.principalBalance - scheduleItem.principal;
          ledger.accruedInterestBalance = 0;
          ledger.cycleAccruedInterest = 0;
        }
      }
    });

    const preview = {
      payment: paymentAmount,
      daysPastDue: 0,
      accruedInterest: ledger.cycleAccruedInterest,
      accruedBalance: {
        fees: 0,
        interest: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      paymentBalance: {
        fees: 0,
        interest: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      unpaidBalance: {
        fees: 0,
        interest: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      amendedBalance: {
        amendedInterest: 0,
        amendedPrincipal: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      paymentSchedule: undefined as IPaymentScheduleItem[],
      nextPaymentSchedule: moment(paymentManagement.nextPaymentSchedule)
        .startOf('day')
        .toDate(),
      newScheduleItemIndex: 0,
      newScheduleItemTransactionId: '',
      payoff: 0,
    };

    let nextScheduleItem = paymentSchedule.find(
      (scheduleItem) => scheduleItem.status === 'opened',
    );

    const isPayoff = paymentAmount >= ledger.payoff;
    if (isPayoff) {
      preview.accruedBalance.fees = ledger.accruedFeesBalance;
      preview.accruedBalance.interest = isPromoAmount
        ? 0
        : ledger.accruedInterestBalance;
      preview.accruedBalance.principal = ledger.principalBalance;
      preview.accruedBalance.unpaidInterest = ledger.unpaidInterestBalance;
      preview.accruedInterest = ledger.cycleAccruedInterest;

      preview.daysPastDue = ledger.daysPastDue;

      preview.paymentBalance.fees = ledger.accruedFeesBalance;
      preview.paymentBalance.interest = isPromoAmount
        ? 0
        : ledger.accruedInterestBalance;
      preview.paymentBalance.principal = ledger.principalBalance;
      preview.paymentBalance.unpaidInterest = ledger.unpaidInterestBalance;

      preview.payoff = 0;

      preview.unpaidBalance.fees = 0;
      preview.unpaidBalance.interest = 0;
      preview.unpaidBalance.principal = 0;
      preview.unpaidBalance.unpaidInterest = 0;
    } else {
      preview.accruedBalance.fees = ledger.accruedFeesBalance;
      preview.accruedBalance.interest = isPromoAmount
        ? 0
        : ledger.cycleAccruedInterest;
      preview.accruedBalance.principal = ledger.principalBalance; //- ledger.paidPrincipalBalance;
      preview.accruedBalance.unpaidInterest = ledger.unpaidInterestBalance;

      preview.accruedInterest = isPromoAmount ? 0 : ledger.cycleAccruedInterest;
      preview.daysPastDue = ledger.daysPastDue;

      // apply payment to balances
      let payment: number = paymentAmount;
      const paidFees = Math.min(ledger.accruedFeesBalance, payment);
      payment -= paidFees;
      const unpaidFees = this.toFixed(ledger.accruedFeesBalance - paidFees, 2);
      const pastDueInterest = ledger.unpaidInterestBalance;
      const paidPastDueInterest = Math.min(pastDueInterest, payment);
      if (this.num == 0) {
        //paidPastDueInterest = 0; //Math.min(pastDueInterest, payment);
      }
      payment -= paidPastDueInterest;
      const unpaidPastDueInterest = this.toFixed(
        ledger.unpaidInterestBalance - paidPastDueInterest,
        2,
      );
      const interestBalance = ledger.cycleAccruedInterest;
      const paidInterest = isPromoAmount
        ? 0
        : Math.min(interestBalance, payment);
      payment -= paidInterest;
      const unpaidInterestBalance = this.toFixed(
        interestBalance - paidInterest,
        2,
      );
      const paidPrincipal = this.toFixed(payment, 2);
      const unpaidPrincipal = this.toFixed(
        ledger.principalBalance - paidPrincipal,
        2,
      );

      preview.paymentBalance.fees = paidFees;
      preview.paymentBalance.interest = paidInterest;
      preview.paymentBalance.principal = paidPrincipal;
      preview.paymentBalance.unpaidInterest = paidPastDueInterest;

      preview.payoff = unpaidPrincipal;

      preview.unpaidBalance.fees = unpaidFees;
      preview.unpaidBalance.interest = isPromoAmount
        ? 0
        : unpaidInterestBalance;
      preview.unpaidBalance.principal = unpaidPrincipal;
      preview.unpaidBalance.unpaidInterest = unpaidPastDueInterest;
    }

    const {
      newScheduleItemTransactionId,
      newScheduleItemIndex,
      newPaymentManagement,
    } = this.previewAmortizedSchedule(
      paymentAmount,
      paymentDate,
      nextScheduleItem,
      paymentManagement,
      ledger,
      preview.paymentBalance,
      requestId,
    );
    preview.newScheduleItemIndex = newScheduleItemIndex;
    preview.newScheduleItemTransactionId = newScheduleItemTransactionId;
    paymentManagement = newPaymentManagement;
    preview.paymentSchedule = paymentManagement.paymentSchedule;
    nextScheduleItem = paymentManagement.paymentSchedule.find(
      (scheduleItem) => scheduleItem.status === 'opened',
    );
    preview.nextPaymentSchedule = nextScheduleItem.date;

    const response = {
      paymentAmount,
      ledger,
      preview,
      newPaymentScheduleItem:
        paymentManagement.paymentSchedule[newScheduleItemIndex],
    };

    return response;
  }

  async makePaymentRenderDialog(
    makePaymentDto: MakePaymentDialogDto,
    requestId: string,
  ) {
    const { screenTracking } = makePaymentDto;
    let { amount, paymentDate } = makePaymentDto;
    const paymentManagement: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${screenTracking}`,
          requestId,
        ),
      );
    }
    const today = moment().startOf('day').toDate();
    const dateBoundary = moment(today).add(2, 'months').toDate();
    const { currentPaymentAmount, payOffAmount } = paymentManagement;
    if (moment(paymentDate).startOf('day').isBefore(today)) {
      paymentDate = today;
    } else if (moment(paymentDate).startOf('day').isAfter(dateBoundary)) {
      paymentDate = today;
    }

    if (!amount || amount <= 0) {
      amount =
        currentPaymentAmount > payOffAmount
          ? payOffAmount
          : currentPaymentAmount;
    } else if (amount >= payOffAmount) {
      amount = payOffAmount;
    }

    // regular payment
    const previewResult = this.previewPayment(
      paymentManagement,
      amount,
      paymentDate,
      requestId,
    );
    const { ledger } = previewResult;

    const response = {
      regularPayment:
        currentPaymentAmount > payOffAmount
          ? payOffAmount
          : currentPaymentAmount,
      payoff: ledger.payoff,
      previewResult,
    };

    this.logger.log(
      'Adjusting schedule with params:',
      `${LedgerService.name}#adjustSchedule`,
      requestId,
      { response },
    );

    return response;
  }

  async submitPayment(submitPaymentDto: SubmitPaymentDto, requestId: string) {
    const { paymentMethodToken, screenTracking } = submitPaymentDto;
    let { amount, paymentDate } = submitPaymentDto;
    const today = moment().startOf('day').toDate();
    const dateBoundary = moment(today).add(2, 'months').toDate();
    if (
      moment(paymentDate).startOf('day').isBefore(moment(today).startOf('day'))
    ) {
      paymentDate = today;
    }
    if (
      moment(paymentDate)
        .startOf('day')
        .isAfter(moment(dateBoundary).startOf('day'))
    ) {
      paymentDate = today;
    }

    const paymentManagement: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        where: {
          screenTracking,
        },
        relations: ['user', 'practiceManagement'],
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${screenTracking}`,
          requestId,
        ),
      );
    }

    if (!amount || amount <= 0) {
      amount = paymentManagement.currentPaymentAmount;
    } else if (amount >= paymentManagement.payOffAmount) {
      amount = paymentManagement.payOffAmount;
    }

    const { preview } = this.previewPayment(
      paymentManagement,
      amount,
      paymentDate,
      requestId,
    );

    const updatedPaymentManagement = {
      paymentSchedule: preview.paymentSchedule,
      payOffAmount: paymentManagement.payOffAmount,
      status: paymentManagement.status,
      promoStatus: paymentManagement.promoStatus,
    };
    let paymentDetails: Payment | undefined;
    if (moment(paymentDate).startOf('day').isSame(today, 'day')) {
      const payment: Payment = await this.makePayment(
        paymentManagement,
        paymentMethodToken,
        amount,
        requestId,
      );
      preview.paymentSchedule[preview.newScheduleItemIndex].paymentReference =
        payment.paymentReference;
      preview.paymentSchedule[preview.newScheduleItemIndex].paymentId =
        payment.id;
      preview.paymentSchedule[preview.newScheduleItemIndex].status =
        payment.status;
      updatedPaymentManagement.payOffAmount = preview.payoff;

      if (preview.unpaidBalance.principal <= 0) {
        updatedPaymentManagement.status = 'paid';
        updatedPaymentManagement.promoStatus = 'unavailable';
      }

      paymentDetails = payment;
    }

    await this.paymentManagementModel.update(
      { id: paymentManagement.id },
      updatedPaymentManagement,
    );

    if (paymentDetails) {
      return paymentDetails;
    }
  }

  async amendPayment(submitPaymentDto: SubmitPaymentDto, requestId: string) {
    const { screenTracking } = submitPaymentDto;
    let { amount, paymentDate } = submitPaymentDto;
    const today = moment().startOf('day').toDate();

    if (
      moment(paymentDate).startOf('day').isBefore(moment(today).startOf('day'))
    ) {
      paymentDate = today;
    }

    const paymentManagement: PaymentManagement | null =
      await this.paymentManagementModel.findOne({
        where: {
          screenTracking,
        },
        relations: ['user', 'practiceManagement'],
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${screenTracking}`,
          requestId,
        ),
      );
    }

    if (!amount || amount <= 0) {
      amount = paymentManagement.currentPaymentAmount;
    } else if (amount >= paymentManagement.payOffAmount) {
      amount = paymentManagement.payOffAmount;
    }
    let paymentManagementId = '';
    const scheduleItemIndex = 0;
    let paymentSchedule: IPaymentScheduleItem[];
    let payment: Payment;
    try {
      // get default card token
      paymentManagementId = paymentManagement.id;
      const user = paymentManagement.user as User;
      let cardToken = await this.loanPaymentProCardTokenModel.findOne({
        where: {
          user,
          isDefault: true,
        },
      });

      if (!cardToken) {
        cardToken = await this.loanPaymentProCardTokenModel.findOne({
          user,
        });
        if (!cardToken) {
          this.logger.error(
            `Payment method token for user id ${user.id} not found`,
            `${PaymentService.name}#makeAutomaticPayment`,
          );
        }
      }

      // find schedule items
      const paymentScheduleItems: IPaymentScheduleItem[] =
        paymentManagement.paymentSchedule;
      if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
        return;
      }

      this.logger.log(
        `Processing AmendPayment payment for payment management id ${paymentManagementId}\n\n${screenTracking}`,
        `${PaymentService.name}#makeAutomaticPayment`,
      );

      const scheduleItemIndex = paymentScheduleItems.findIndex(
        (item) => item.status === 'opened',
      );
      const today = moment().startOf('day').toDate();
      if (scheduleItemIndex !== -1) {
        this.logger.log(
          `make AmendPayment for payment management id ${paymentScheduleItems[scheduleItemIndex].transactionId} processed successfully ${paymentManagement.id}.\n\n\n ${paymentScheduleItems[scheduleItemIndex].amount}\n\n\n${submitPaymentDto.amount}`,
          `${paymentScheduleItems[scheduleItemIndex].transactionId}#makeAmendPayment`,
        );

        //make payment
        const paymentAmount = submitPaymentDto.amount;
        payment = await this.makePayment(
          paymentManagement,
          cardToken.paymentMethodToken,
          paymentAmount,
        );
        paymentScheduleItems[scheduleItemIndex].payment = paymentAmount;
        paymentScheduleItems[scheduleItemIndex].amount = paymentAmount;
        paymentScheduleItems[scheduleItemIndex].paidInterest =
          paymentScheduleItems[scheduleItemIndex].interest;
        paymentScheduleItems[scheduleItemIndex].paidPrincipal =
          paymentScheduleItems[scheduleItemIndex].principal;
        paymentScheduleItems[scheduleItemIndex].status = 'paid';
        paymentScheduleItems[scheduleItemIndex].isAmended = true;
        paymentScheduleItems[scheduleItemIndex].paymentType = 'manual';
        paymentScheduleItems[
          scheduleItemIndex
        ].paymentReference = `${payment.paymentReference} Amended`;
        paymentScheduleItems[scheduleItemIndex].paymentDate = today;
        paymentScheduleItems[
          scheduleItemIndex
        ].transactionMessage = `${payment.transactionMessage} Payment Amended`;
        paymentScheduleItems[scheduleItemIndex].transId = payment.transId;

        const updatedPaymentManagement = {
          paymentSchedule: paymentManagement.paymentSchedule,
          status:
            paymentManagement.payOffAmount <= 0
              ? 'paid'
              : paymentManagement.status,
          nextPaymentSchedule: today,
        };

        // find next payment date
        const nextPaymentScheduleItem: IPaymentScheduleItem =
          paymentManagement.paymentSchedule.find(
            (scheduleItem) => scheduleItem.status === 'opened',
          );
        if (nextPaymentScheduleItem) {
          updatedPaymentManagement.nextPaymentSchedule =
            nextPaymentScheduleItem.date;
        }

        await this.paymentManagementModel.update(
          { id: paymentManagement.id },
          updatedPaymentManagement,
        );
        this.logger.log(
          `make AmendPayment for payment management id ${paymentManagementId} processed successfully.`,
          `${PaymentService.name}#makeAmendPayment`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Could not process amend payment for payment management id ${paymentManagementId}`,
        `${PaymentService.name}#makeAmendPayment`,
        undefined,
        error,
      );

      // add transaction status to payment schedule

      const transactionStatus: IPaymentScheduleStatusItem = {
        amount: paymentManagement.currentPaymentAmount,
        date: paymentManagement.paymentSchedule[scheduleItemIndex].date,
        transactionMessage: error.message,
        transId: error.transactionId,
      };
      const newPaymentTransactionstatus: IPaymentScheduleStatusItem[] = [];
      newPaymentTransactionstatus.push(transactionStatus);

      const updatedPaymentManagement = {
        paymentSchedule: paymentManagement.paymentSchedule,
      };

      await this.paymentManagementModel.update(
        { id: paymentManagement.id },
        updatedPaymentManagement,
      );
      // add failed schedule item to payment schedule

      const failedScheduleItem: IPaymentScheduleItem = {
        ...paymentSchedule[scheduleItemIndex],
        status: 'failed',
        transactionMessage: error.message,
        transId: error.transactionId,
        date: today,
      };
      const newPaymentSchedule: IPaymentScheduleItem[] = [];
      paymentSchedule.forEach((scheduleItem) => {
        if (moment(scheduleItem.date).isBefore(today, 'day')) {
          newPaymentSchedule.push(scheduleItem);
        }
      });
      newPaymentSchedule.push(failedScheduleItem);

      await this.paymentManagementModel.update(paymentManagementId, {
        paymentSchedule: newPaymentSchedule,
      });
    }

    if (payment) {
      return payment;
    }
    this.logger.log('Amend Payment', `${PaymentService.name}#makeAmendPayment`);
  }

  previewAmortizedSchedule(
    paymentAmount: number,
    paymentDate: Date,
    paymentScheduleItem: IPaymentScheduleItem,
    paymentManagement: PaymentManagement,
    ledger: ILedger,
    paidBalances: {
      fees: number;
      unpaidInterest: number;
      interest: number;
      principal: number;
    },
    requestId: string,
  ): {
    newPaymentManagement: PaymentManagement;
    newScheduleItemIndex: number;
    newScheduleItemTransactionId: string;
  } {
    this.logger.log(
      'Adjusting schedule with params:previewAmortizedSchedule',
      `${LedgerService.name}#adjustSchedule`,
      requestId,
      { paymentAmount, paymentScheduleItem, paymentManagement, ledger },
    );
    const {
      paymentSchedule,
      currentPaymentAmount,
      promoPaymentAmount,
      promoStatus,
    } = paymentManagement;
    const newPaymentSchedule: IPaymentScheduleItem[] = [];
    const isPromoAmount = false;
    // currentPaymentAmount >= promoPaymentAmount && promoStatus === 'available'
    //   ? true
    //   : false;
    if (this.num == 0) {
      ledger.unpaidInterestBalance = 0;
    }

    const newScheduleItem: IPaymentScheduleItem = {
      amount: paymentAmount,
      date: paymentDate,
      endPrincipal: this.toFixed(
        ledger.principalBalance - paidBalances.principal,
        2,
      ),
      fees: ledger.accruedFeesBalance,
      interest: isPromoAmount ? 0 : ledger.cycleAccruedInterest,
      paidFees: paidBalances.fees,
      paidPastDueInterest: paidBalances.unpaidInterest,
      paidInterest: paidBalances.interest,
      paidPrincipal: paidBalances.principal,
      pastDueInterest: paidBalances.unpaidInterest, //ledger.unpaidInterestBalance,
      payment: paymentAmount,
      paymentType: 'manual',
      principal: paidBalances.principal,
      startPrincipal: ledger.principalBalance,
      status: 'opened',
      transactionId: nanoid(10),
    };

    if (this.num != 0) {
      newScheduleItem.pastDueInterest = ledger.unpaidInterestBalance;
    }
    // ledger.principalBalance =
    //   ledger.principalBalance - newScheduleItem.principal;

    let principalPayoff = this.toFixed(
      ledger.principalBalance - paidBalances.principal,
      2,
    );
    let nextUnpaidInterest = this.toFixed(ledger.unpaidInterestBalance, 2);
    let recalculatedInterest = ledger.cycleAccruedInterest;
    let accruedInterestDate = moment(paymentDate).startOf('day').toDate();

    paymentSchedule.forEach((scheduleItem) => {
      if (
        moment(scheduleItem.date).startOf('day').isBefore(paymentDate, 'day')
        // &&
        // scheduleItem.endPrincipal > 0
      ) {
        newPaymentSchedule.push(scheduleItem);
      }
    });

    // let pastDuePaymentFlag = false;
    // newPaymentSchedule.every((scheduleItem2, index) => {
    //   if (
    //     scheduleItem2.status === 'opened' &&
    //     moment(scheduleItem2.date)
    //       .startOf('day')
    //       .isSameOrBefore(moment().startOf('day'))
    //   ) {
    //     newPaymentSchedule.splice(index, 1);
    //     pastDuePaymentFlag = true;
    //     return false;
    //   }
    //   return true;
    // });
    newPaymentSchedule.push(newScheduleItem);

    this.logger.log(
      'Adjusted payment management:3',
      `${LedgerService.name}#adjustSchedule`,
      requestId,
      JSON.stringify(newPaymentSchedule),
    );
    const newScheduleItemIndex = newPaymentSchedule.length - 1;
    const newScheduleItemTransactionId = newScheduleItem.transactionId;
    // In non-autopay scenario, If the scheduled payment is within 30 days
    // before or is after the next scheduled payment, then we replace the
    // next scheduled item with a new one.
    if (!paymentManagement.canRunAutomaticPayment) {
      paymentSchedule.every((scheduleItem, index) => {
        const scheduledPaymentCutOffDate = moment(scheduleItem.date).subtract(
          30,
          'days',
        );
        this.logger.log(
          'Cant Run Automatic Payment ',
          `${scheduleItem.date}\n${scheduledPaymentCutOffDate}\n${index}\n${newScheduleItem.date}
          #adjustSchedule`,
          requestId,
          JSON.stringify(newScheduleItem),
        );
        if (
          moment(newScheduleItem.date)
            .startOf('day')
            .isSameOrAfter(
              moment(scheduledPaymentCutOffDate).startOf('day'),
              'day',
            ) &&
          scheduleItem.status === 'opened'
        ) {
          this.logger.log(
            'Cant Run Automatic Payment if',
            `\n${index}\n${paymentSchedule.length}\n${paymentSchedule}
             #adjustSchedule`,
            requestId,
            JSON.stringify(newScheduleItem),
          );
          paymentSchedule.splice(index, 1);
          this.logger.log(
            'Cant Run Automatic Payment if',
            `${paymentSchedule}\n${index}\n${paymentSchedule.length}
             #adjustSchedule`,
            requestId,
            JSON.stringify(newScheduleItem),
          );
          return false;
        }
        return true;
      });
    }
    if (newScheduleItem.endPrincipal > 0) {
      let indexes = 0;
      let indexes1 = 0;
      paymentSchedule.forEach((scheduleItem) => {
        if (
          moment(scheduleItem.date)
            .startOf('day')
            .isSame(moment(newScheduleItem.date).startOf('day'), 'day') &&
          scheduleItem.status === 'opened'
        ) {
          indexes1 = indexes;
        }
        indexes = indexes + 1;
      });
      indexes = 0;
      paymentSchedule.forEach((scheduleItem) => {
        if (principalPayoff === 0) {
          return;
        }

        if (
          moment(scheduleItem.date)
            .startOf('day')
            .isSameOrAfter(
              moment(newScheduleItem.date).startOf('day'),
              'day',
            ) &&
          scheduleItem.status === 'opened'
        ) {
          this.logger.log(
            'Cant Run Automatic Payment if',
            `\n${scheduleItem.date}\n${newScheduleItem.date}\n\n\n${indexes}
            \n${accruedInterestDate}
             #adjustSchedule`,
            requestId,
            JSON.stringify(newScheduleItem),
          );

          // unpaid interest

          const nextInterestPayment =
            nextUnpaidInterest >= scheduleItem.amount
              ? scheduleItem.amount
              : nextUnpaidInterest;

          if (indexes1 == 1) {
          } else {
            scheduleItem.interest = nextInterestPayment;
          }

          scheduleItem.principal = this.toFixed(
            scheduleItem.amount - scheduleItem.interest,
            2,
          );

          if (indexes1 == 1) {
            nextUnpaidInterest = this.toFixed(
              scheduleItem.interest - nextUnpaidInterest,
              2,
            );
            indexes1 = 10;
          } else {
            nextUnpaidInterest = this.toFixed(
              nextUnpaidInterest - scheduleItem.interest,
              2,
            );
          }

          // accrued interest
          const accruedInterestDays = moment(scheduleItem.date)
            .startOf('day')
            .diff(moment(accruedInterestDate).startOf('day'), 'days');

          scheduleItem.interest = isPromoAmount
            ? 0
            : this.toFixed(
              ((principalPayoff * paymentManagement.apr) / 100 / 365) *
              accruedInterestDays,
              2,
            );

          const itemInterestPayment = this.toFixed(
            scheduleItem.interest >= scheduleItem.principal
              ? scheduleItem.principal + ledger.unpaidInterestBalance
              : scheduleItem.interest,
            2,
          );

          scheduleItem.interest = this.toFixed(
            nextUnpaidInterest + itemInterestPayment,
            2,
          );

          scheduleItem.principal = this.toFixed(
            itemInterestPayment >= scheduleItem.principal
              ? 0
              : scheduleItem.principal - itemInterestPayment,
            2,
          );

          if (scheduleItem.principal > principalPayoff) {
            scheduleItem.principal = principalPayoff;
            scheduleItem.amount = this.toFixed(
              scheduleItem.interest + scheduleItem.principal,
              2,
            );
          }

          scheduleItem.startPrincipal = principalPayoff;
          scheduleItem.endPrincipal = this.toFixed(
            scheduleItem.startPrincipal - scheduleItem.principal,
            2,
          );

          principalPayoff = this.toFixed(
            principalPayoff - scheduleItem.principal,
            2,
          );
          //if (scheduleItem.date != newScheduleItem.date) {
          newPaymentSchedule.push(scheduleItem);

          accruedInterestDate = scheduleItem.date;
          recalculatedInterest = this.toFixed(
            recalculatedInterest + ledger.unpaidInterestBalance,
            2,
          );
        }
      });
    }

    paymentManagement.paymentSchedule = newPaymentSchedule;

    const response = {
      newPaymentManagement: paymentManagement,
      newScheduleItemIndex,
      newScheduleItemTransactionId,
    };
    this.logger.log(
      'Adjusted payment management:',
      `${LedgerService.name}#adjustSchedule`,
      requestId,
      response,
    );

    return response;
  }

  amortizeSchedule(
    amount: number,
    paymentManagement: PaymentManagement,
    requestId: string,
    ledger?: ILedger,
  ): IPaymentScheduleItem[] {
    const paymentDate = moment().startOf('day').toDate();
    if (!ledger) {
      ledger = this.ledgerService.getPaymentLedger(
        paymentManagement,
        paymentDate,
        requestId,
      );
    }
    this.logger.log(
      'Adjusting schedule with params:',
      `${LedgerService.name}#adjustSchedule`,
      requestId,
      { amount, paymentManagement },
    );
    const { paymentSchedule, apr, promoPaymentAmount, promoStatus } =
      paymentManagement;
    const newPaymentSchedule: IPaymentScheduleItem[] = [];
    const nextScheduleItem = paymentSchedule.find(
      (scheduleItem) => scheduleItem.status === 'opened',
    );
    let principalPayoff = this.toFixed(ledger.principalBalance, 2);
    let nextUnpaidInterest = this.toFixed(ledger.unpaidInterestBalance, 2);
    let recalculatedInterest = ledger.cycleAccruedInterest;
    let accruedInterestDate = moment(nextScheduleItem.date)
      .startOf('day')
      .toDate();
    let month = nextScheduleItem.month;

    paymentSchedule.forEach((scheduleItem) => {
      if (
        moment(scheduleItem.date).isSameOrBefore(paymentDate, 'day') &&
        scheduleItem.status === 'paid'
      ) {
        newPaymentSchedule.push(scheduleItem);
      }
    });

    while (principalPayoff > 0) {
      // empty schedule
      const newScheduleItem: IPaymentScheduleItem = {
        amount,
        date: accruedInterestDate,
        endPrincipal: 0,
        fees: 0,
        interest: 0,
        month,
        paidFees: 0,
        paidInterest: 0,
        paidPastDueInterest: 0,
        paidPrincipal: 0,
        pastDueInterest: 0,
        payment: 0,
        paymentType: 'automatic',
        principal: 0,
        startPrincipal: 0,
        status: 'opened',
        transactionId: nanoid(10),
      };

      // unpaid interest
      const nextInterestPayment =
        nextUnpaidInterest >= newScheduleItem.amount
          ? newScheduleItem.amount
          : nextUnpaidInterest;
      newScheduleItem.interest = nextInterestPayment;
      newScheduleItem.principal = this.toFixed(
        newScheduleItem.amount - newScheduleItem.interest,
        2,
      );
      nextUnpaidInterest = this.toFixed(
        nextUnpaidInterest - newScheduleItem.interest,
        2,
      );

      // accrued interest
      const accruedInterestDays = moment(accruedInterestDate)
        .add(1, 'month')
        .startOf('day')
        .diff(moment(accruedInterestDate).startOf('day'), 'days');
      const isPromoAmount = false;
      // amount >= promoPaymentAmount && promoStatus === 'available'
      //   ? true
      //   : false;
      newScheduleItem.interest = isPromoAmount
        ? 0
        : this.toFixed(
          ((principalPayoff * apr) / 100 / 365) * accruedInterestDays,
          2,
        );
      const itemInterestPayment = this.toFixed(
        newScheduleItem.interest >= newScheduleItem.principal
          ? newScheduleItem.principal + ledger.unpaidInterestBalance
          : newScheduleItem.interest,
        2,
      );
      newScheduleItem.interest = this.toFixed(
        nextUnpaidInterest + itemInterestPayment,
        2,
      );
      newScheduleItem.principal = this.toFixed(
        itemInterestPayment >= newScheduleItem.principal
          ? 0
          : newScheduleItem.principal - itemInterestPayment,
        2,
      );

      if (newScheduleItem.principal > principalPayoff) {
        newScheduleItem.principal = principalPayoff;
        newScheduleItem.amount = this.toFixed(
          newScheduleItem.interest + newScheduleItem.principal,
          2,
        );
      }
      newScheduleItem.startPrincipal = principalPayoff;
      principalPayoff = this.toFixed(
        principalPayoff - newScheduleItem.principal,
        2,
      );

      newPaymentSchedule.push(newScheduleItem);
      accruedInterestDate = moment(accruedInterestDate)
        .add(1, 'month')
        .startOf('day')
        .toDate();
      recalculatedInterest = this.toFixed(
        recalculatedInterest + ledger.unpaidInterestBalance,
        2,
      );
      month++;
    }

    const response = newPaymentSchedule;
    this.logger.log(
      'Adjusted payment management:',
      `${LedgerService.name}#adjustSchedule`,
      requestId,
      response,
    );

    return response;
  }

  async getPaymentSchedule(request: any, token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const findUser = await this.userModel.findOne({
      where: {
        customerUpdateToken: hashedToken,
        customerUpdateTokenExpires: MoreThan(new Date()),
      },
    });

    if (!findUser) {
      const errorMessage = 'Invalid user';
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#getPaymentSchedule`,
        request.id,
      );

      throw new UnauthorizedException();
    }

    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: findUser.id,
    });
    // Updated Loan Status to Closed
    const paymentManagement = await this.paymentManagementModel.findOne({
      screenTracking: findscreenTracking.id,
    });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${PaymentService.name}#getPaymentSchedule`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Refund Payment management not found for user id ${findscreenTracking.id}`,
          request.id,
        ),
      );
    }

    return paymentManagement;
  }

  toFixed(number: number, precision: number) {
    return parseFloat(number.toFixed(precision));
  }

  async triggerAutoPay(paymentManagementId: string, status?: boolean) {
    if (status == undefined) {
      const paymentManagementData = await this.paymentManagementModel.findOne({
        id: paymentManagementId,
      });
      status = !paymentManagementData.canRunAutomaticPayment;
    }
    await this.paymentManagementModel.update(paymentManagementId, {
      canRunAutomaticPayment: status,
    });
  }
}
