import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaymentManagement } from '../payment-management/payment-management.entity';
import { Payment } from '../entities/payment.entity';
import { LoanPaymentProCardSale } from './loanpaymentpro-card-sale.entity';
import { LoanPaymentProCardToken } from './loanpaymentpro-card-token.entity';
import { AddCardDto } from './validation/addCard.dto';
import { LoggerService } from '../../../logger/services/logger.service';
import { AppService } from '../../../app.service';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { User } from '../../../user/entities/user.entity';

@Injectable()
export class LoanpaymentproService {
  constructor(
    @InjectRepository(LoanPaymentProCardToken)
    private readonly loanPaymentProCardTokenModel: Repository<LoanPaymentProCardToken>,
    @InjectRepository(PaymentManagement)
    private readonly paymentManagementModel: Repository<PaymentManagement>,
    @InjectRepository(LoanPaymentProCardSale)
    private readonly loanPaymentProCardSaleModel: Repository<LoanPaymentProCardSale>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
  ) {}

  /**
   * Add a payment card
   * @param addCardDto AddCardDTO
   * @param requestId unique request id
   */
  async v2PaymentCardsAdd(
    addCardDto: AddCardDto,
    requestId: string,
  ): Promise<LoanPaymentProCardToken> {
    const { cardCode, expMonth, expYear, screenTrackingId } = addCardDto;
    let errorMessage = '';

    this.logger.log(
      'Adding card with params: ',
      `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
      requestId,
      addCardDto,
    );
    const screenTrackingDocument = await this.screenTrackingModel.findOne({
      where: { id: screenTrackingId },
      relations: ['user'],
    });

    if (!screenTrackingDocument) {
      errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const user: User = screenTrackingDocument.user as User;
    if (!user) {
      errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const cardNumberLastFour = addCardDto.cardNumber.substr(-4);
    const isExistingCard = await this.loanPaymentProCardTokenModel.findOne({
      cardNumberLastFour,
      cardCode,
      expMonth,
      expYear,
      user,
    });
    if (isExistingCard) {
      errorMessage = 'This card has already been added';
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }
    const apiUrl = this.configService.get<string>('v2BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/paymentcards/add`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: addCardDto,
    };
    const { status, data } = (await axios(options)) as Record<string, any>;

    if (status !== 200 || data.ResponseCode !== '21') {
      const { Status, ResponseCode, Message, TransactionId } = data;
      this.logger.error(
        `Error ${Message}:`,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
        { status, ...(data as Record<string, any>) },
      );
      throw new BadRequestException({
        statusCode: 400,
        status: Status,
        message: Message,
        responseCode: ResponseCode,
        transactionId: TransactionId,
        requestId,
      });
    }

    const { CustomerToken, PaymentMethodToken } = data;

    //Search for the user's cards and make the previous cards to "isDefault: false"
    await this.loanPaymentProCardTokenModel.update(
      {
        user: user.id,
        isDefault: true,
      },
      {
        isDefault: false,
      },
    );

    let cardToken = this.loanPaymentProCardTokenModel.create({
      ...addCardDto,
      cardNumberLastFour,
      customerToken: CustomerToken,
      paymentMethodToken: PaymentMethodToken,
      user: user.id,
    });
    cardToken = await this.loanPaymentProCardTokenModel.save(cardToken);
    this.logger.log(
      'Card added',
      `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
      requestId,
    );

    return cardToken;
  }

  async v21PaymentsRefundCard(
    transactionId: string,
    InvoiceId: string,
    Amount: string,
    requestId: string,
  ) {
    this.logger.log(
      'Refund payment with params:',
      `${LoanpaymentproService.name}#v21PaymentsRefundCard`,
      requestId,
      { transactionId, InvoiceId, Amount },
    );

    //v2BaseUrl: 'https://gateway.loanpaymentpro.com/v2',
    //v2/payments/{transaction_id}/refund
    //'Amount' => '5.00',
    //'InvoiceId' => 'LP0003'

    const apiUrl = this.configService.get<string>('v2BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/payments/${transactionId}/refund`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: {
        Amount: Amount,
        InvoiceId: InvoiceId,
      },
    };

    const { data } = await axios(options);

    return data;
  }

  async v21PaymentsReturnRun(
    user: string,
    paymentMethodToken: string,
    amount: number,
    requestId: string,
  ) {
    this.logger.log(
      'Making payment with params:',
      `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
      requestId,
      { user, paymentMethodToken },
    );
    const paymentManagement: PaymentManagement =
      await this.paymentManagementModel.findOne({
        user,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${user}`,
          requestId,
        ),
      );
    }
    const cardDetails: LoanPaymentProCardToken =
      await this.loanPaymentProCardTokenModel.findOne({
        user,
        paymentMethodToken,
      });
    if (!cardDetails) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Card token not found for user ${user}`,
          requestId,
        ),
      );
    }

    ///payments/customers/{customer_token}/paymentcards/{paymentmethod_token}/disburse
    ///payments/paymentcards/{paymentmethod_token}/disburse
    const apiUrl = this.configService.get<string>('v2BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/payments/paymentcards/${cardDetails.paymentMethodToken}/disburse`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: {
        Amount: '' + amount,
      },
    };

    const { status, data } = await axios(options);

    return status;
  }

  async v21PaymentsPaymentCardsRun(
    user: string,
    paymentMethodToken: string,
    payment: Payment,
    requestId: string,
  ): Promise<LoanPaymentProCardSale> {
    this.logger.log(
      'Making payment with params:',
      `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
      requestId,
      { user, paymentMethodToken, payment },
    );
    const paymentManagement: PaymentManagement =
      await this.paymentManagementModel.findOne({
        user,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${user}`,
          requestId,
        ),
      );
    }
    const cardDetails: LoanPaymentProCardToken =
      await this.loanPaymentProCardTokenModel.findOne({
        user,
        paymentMethodToken,
      });
    if (!cardDetails) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Card token not found for user ${user}`,
          requestId,
        ),
      );
    }

    const apiUrl = this.configService.get<string>('v21BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/payments/paymentcards/${cardDetails.paymentMethodToken}/run`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: {
        Amount: '' + payment.amount,
        InvoiceId: payment.paymentReference,
      },
    };
    const { status, data } = (await axios(options)) as Record<string, any>;

    const { Status, ResponseCode, Message, AuthCode, TransactionId } = data;
    const paymentCardSaleObj = {
      user,
      payment: payment.id,
      cardToken: cardDetails.id,
      status: Status,
      message: Message,
      responseCode: ResponseCode,
      authCode: AuthCode,
      transactionId: TransactionId,
      paymentRequest: {
        amount: payment.amount,
        invoiceId: payment.paymentReference,
      },
      paymentResponse: data,
    };
    if (status !== 200 || ResponseCode !== '29') {
      const cardSale: LoanPaymentProCardSale =
        this.loanPaymentProCardSaleModel.create(paymentCardSaleObj);
      await this.loanPaymentProCardSaleModel.save(cardSale);
      this.logger.error(
        `Error ${Message}:`,
        `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
        requestId,
        { status, data },
      );
      throw new BadRequestException({
        statusCode: 400,
        status: Status,
        message: Message,
        responseCode: ResponseCode,
        transactionId: TransactionId,
        requestId,
      });
    }

    let cardSale = this.loanPaymentProCardSaleModel.create(paymentCardSaleObj);
    cardSale = await this.loanPaymentProCardSaleModel.save(cardSale);
    this.logger.log(
      'Payment made:',
      `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
      requestId,
      cardSale,
    );

    return cardSale;
  }

  async getUserCards(screenTrackingId: string, requestId: string) {
    const screenTracking: ScreenTracking =
      await this.screenTrackingModel.findOne({
        where: { id: screenTrackingId },
        relations: ['user'],
      });

    if (!screenTracking) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found.`,
          requestId,
        ),
      );
    }
    if (!screenTracking.user) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `User not found for screen tracking id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    const user = screenTracking.user as User;
    const cards: LoanPaymentProCardToken[] | null =
      await this.loanPaymentProCardTokenModel.find({ user });
    // if (!cards || cards.length <= 0) {
    //   throw new NotFoundException(
    //     this.appService.errorHandler(
    //       404,
    //       `No cards found for user id ${user.id}`,
    //       requestId,
    //     ),
    //   );
    // }

    const response = cards.map((card) => {
      return {
        paymentMethodToken: card.paymentMethodToken,
        cardNumberLastFour: card.cardNumberLastFour,
        updatedAt: card.updatedAt,
        firstName: card.billingFirstName,
        lastName: card.billingLastName,
        cardExpiration: `${card.expMonth}/${card.expYear}`,
        isDefault: card.isDefault,
      };
    });

    return response;
  }

  async updateCard(paymentMethodToken: string, requestId: string) {
    //Extract user_id from card
    const card = await this.loanPaymentProCardTokenModel.findOne({
      where: {
        paymentMethodToken,
      },
      relations: ['user'],
    });
    const user_id = card.user;

    //Search for the user's cards and make the previous cards to "isDefault: false"
    await this.loanPaymentProCardTokenModel.update(
      {
        user: user_id,
        isDefault: true,
      },
      {
        isDefault: false,
      },
    );

    //set Default Card
    await this.loanPaymentProCardTokenModel.update(
      {
        paymentMethodToken: paymentMethodToken,
      },
      {
        isDefault: true,
      },
    );
  }
}
