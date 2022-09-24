import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import url from 'url';
import {
  Repository,
  MoreThanOrEqual,
  LessThanOrEqual,
  UpdateResult,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { LoggerService } from '../../../logger/services/logger.service';
import { CashLoadDto } from '../validation/cash-load.dto';
import { ActivateAccountDto } from '../validation/activate-account.dto';
import { SimulateCardAuthorizationDto } from '../validation/simulate-card-authorization.dto';
import { SimulateCardSettleDto } from '../validation/simulate-card-settle.dto';
import { BalanceTransferDto } from '../validation/balance-transfer.dto';
import { AccountOverViewDto } from '../validation/account-overview.dto';
import { Card } from '../entities/card.entity';
import { ScreenTracking } from '../../screen-tracking/entities/screen-tracking.entity';
import { Transactions } from '../entities/transactions.entity';
import moment from 'moment';
import { SetCreditLimitDto } from '../validation/set-credit-limit.dto';
import { GetCreditSummaryDto } from '../validation/get-credit-summary.dto';
import { GetTransactionsByDateDto } from '../validation/get-transactions-by-date.dto';
import { SetArchivedDto } from '../validation/set-archived.dto';

@Injectable()
export class GalileoService {
  private baseUrl = this.configService.get<string>('galileoBaseUrl') || '';
  private apiLogin = this.configService.get<string>('apiLogin') || '';
  private apiTransKey = this.configService.get<string>('apiTransKey') || '';
  private providerId = this.configService.get<string>('providerId') || '';
  private prodId = this.configService.get<string>('prodId') || '';

  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingRepository: Repository<ScreenTracking>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async createAccount(screenTrackingId: string, requestId: string) {
    // TODO remove this once we get the CV credentials
    const firstName = 'John';
    const middleName = 'P';
    const lastName = 'Smith';

    this.logger.log(
      `Creating account for screenTracking id ${screenTrackingId}`,
      `${GalileoService.name}#createAccount`,
      requestId,
    );
    const screenTracking: ScreenTracking =
      await this.screenTrackingRepository.findOne(screenTrackingId);
    if (!screenTracking) {
      const errorMessage = `ScreenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#createAccount`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      firstName,
      middleName,
      lastName,
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/createAccount`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#createAccount`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(data, errorMessage);
    }

    // success
    const responseData = data.response_data[0];
    const card = this.cardRepository.create({
      accountNumber: responseData.pmt_ref_no,
      cardNumber: responseData.card_number,
      expiryDate: moment().add(5, 'years').startOf('day').format('MM/YY'),
      responseBody: data,
      screenTracking: screenTracking,
    });
    await this.cardRepository.save(card);
    this.logger.log(
      'Account created successfully',
      `${GalileoService.name}#createAccount`,
      requestId,
      data,
    );

    return data;
  }

  async cashLoad(
    screenTrackingId: string,
    cashLoadDto: CashLoadDto,
    requestId: string,
  ) {
    const { accountNumber, amount } = cashLoadDto;

    this.logger.log(
      `Making deposit with params:`,
      `${GalileoService.name}#cashLoad`,
      requestId,
      { ...cashLoadDto, userId: screenTrackingId },
    );
    const card: Card = await this.cardRepository.findOne({
      where: {
        screenTracking: screenTrackingId,
        accountNumber,
      },
    });
    if (!card) {
      const errorMessage = `Card for screenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#cashLoad`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      amount,
      type: 'RL', // TODO check transaction types logic
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/createPayment`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#createAccount`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    const responseData = data.response_data;
    const transactionTimestamp = new Date().toISOString();
    const transaction: Transactions = this.transactionsRepository.create({
      amount: amount,
      authenticationId: responseData.payment_trans_id,
      card,
      postingTimestamp: transactionTimestamp,
      remainingBalance: responseData.new_balance,
      responseBody: data,
      status: 'settled',
      transactionDescription: 'Cash Load',
      transactionTimestamp,
      transactionType: 'Payment',
      screenTracking: screenTrackingId,
    });
    await Promise.all([
      this.cardRepository.update(
        { screenTracking: screenTrackingId, accountNumber },
        { balance: responseData.new_balance },
      ),
      this.transactionsRepository.save(transaction),
    ]);

    this.logger.log(
      `Deposit made`,
      `${GalileoService.name}#cashLoad`,
      requestId,
    );

    return data;
  }

  async balanceTransfer(
    screenTrackingId: string,
    BalanceTransferDto: BalanceTransferDto,
    requestId: string,
  ) {
    const { accountNumber, amount, accountNumberToTransfer } =
      BalanceTransferDto;

    this.logger.log(
      `Making transfer with params:`,
      `${GalileoService.name}#balanceTransfer`,
      requestId,
      { ...BalanceTransferDto, userId: screenTrackingId },
    );
    const [senderCard, recipientCard] = await Promise.all([
      this.cardRepository.findOne({
        where: {
          screenTracking: screenTrackingId,
          accountNumber,
        },
      }),
      this.cardRepository.findOne({
        where: {
          accountNumber: accountNumberToTransfer,
        },
      }),
    ]);
    if (!senderCard || !recipientCard) {
      const errorMessage = `Card for screenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#balanceTransfer`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      amount,
      transferToAccountNo: accountNumberToTransfer,
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/createAccountTransfer`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const statusCode = data.status_code;

    if (statusCode === '445-06') {
      const errorMessage = 'Insufficient Funds';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#balanceTransfer`,
        requestId,
        data,
      );
      throw new BadRequestException(undefined, errorMessage);
    } else if (statusCode === '445-04') {
      const errorMessage = data.status;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#balanceTransfer`,
        requestId,
        data,
      );
      throw new BadRequestException(undefined, errorMessage);
    } else if (statusCode === '445-05') {
      const errorMessage = data.status;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#balanceTransfer`,
        requestId,
        data,
      );
      throw new BadRequestException(undefined, errorMessage);
    } else if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#balanceTransfer`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    const responseData = data.response_data;
    const transactionTimestamp = new Date().toISOString();
    const transactionSettings = {
      amount: `-${amount}`,
      authenticationId: responseData.adjustment_trans_id,
      card: senderCard,
      postingTimestamp: transactionTimestamp,
      remainingBalance: responseData.new_balance,
      responseBody: data,
      status: 'settled',
      transactionDescription: 'Card to Card',
      transactionTimestamp,
      transactionType: 'Adjustment',
      screenTracking: screenTrackingId,
    };
    const adjustment: Transactions =
      this.transactionsRepository.create(transactionSettings);
    await Promise.all([
      this.cardRepository.update(
        { screenTracking: screenTrackingId, accountNumber },
        { balance: responseData.new_balance },
      ),
      this.transactionsRepository.save(adjustment),
    ]);

    const payment = this.transactionsRepository.create({
      ...transactionSettings,
      amount,
      authenticationId: responseData.payment_trans_id,
      transactionType: 'Payment',
      card: recipientCard,
    });
    await Promise.all([
      await this.cardRepository.update(
        {
          screenTracking: screenTrackingId,
          accountNumber: accountNumberToTransfer,
        },
        { balance: responseData.transfer_to_account.new_balance },
      ),
      this.transactionsRepository.save(payment),
    ]);

    this.logger.log(
      `Transfer made`,
      `${GalileoService.name}#balanceTransfer`,
      requestId,
      data,
    );
  }

  async activateAccount({ accountNumber }: ActivateAccountDto) {
    const transactionId = uuidv4();
    try {
      const bodyParams = new url.URLSearchParams({
        apiLogin: this.apiLogin,
        apiTransKey: this.apiTransKey,
        providerId: this.providerId,
        prodId: this.prodId,
        transactionId,
        accountNo: accountNumber,
        type: '11',
      });
      const { data } = await axios.post<Record<string, any>>(
        `${this.baseUrl}/modifyStatus`,
        bodyParams.toString(),
        {
          headers: {
            'response-content-type': 'json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // success
      if (data.status_code === 0) {
        // const responseData = data.response_data;
        // const rToken = data.rtoken;
      }
      this.logger.log(
        'Account activated successfully',
        GalileoService.name,
        transactionId,
        data,
      );

      return data;
    } catch (error) {
      this.logger.error(
        'Error while activating account',
        GalileoService.name,
        transactionId,
        error,
      );
    }
  }

  async freezeAccount(
    screenTrackingId: string,
    activateAccountDto: ActivateAccountDto,
    requestId: string,
  ): Promise<void> {
    const { accountNumber } = activateAccountDto;

    this.logger.log(
      `Freezing account with params:`,
      `${GalileoService.name}#freezeAccount`,
      requestId,
      { ...activateAccountDto, userId: screenTrackingId },
    );
    const card: Card = await this.cardRepository.findOne({
      where: {
        screenTracking: screenTrackingId,
        accountNumber,
      },
    });
    if (!card) {
      const errorMessage = `Card for screenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#freezeAccount`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      type: '17',
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/modifyStatus`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#freezeAccount`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    await this.cardRepository.update(
      { screenTracking: screenTrackingId, accountNumber },
      { isFrozen: true },
    );
    this.logger.log(
      'Account frozen successfully',
      `${GalileoService.name}#freezeAccount`,
      requestId,
      data,
    );
  }

  async unfreezeAccount(
    screenTrackingId: string,
    activateAccountDto: ActivateAccountDto,
    requestId: string,
  ) {
    const { accountNumber } = activateAccountDto;

    this.logger.log(
      `Unfreezing account with params:`,
      `${GalileoService.name}#unfreezeAccount`,
      requestId,
      { ...activateAccountDto, userId: screenTrackingId },
    );
    const card: Card = await this.cardRepository.findOne({
      where: {
        screenTracking: screenTrackingId,
        accountNumber,
      },
    });
    if (!card) {
      const errorMessage = `Card for screenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#freezeAccount`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      type: '18',
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/modifyStatus`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#unfreezeAccount`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    await this.cardRepository.update(
      { screenTracking: screenTrackingId, accountNumber },
      { isFrozen: false },
    );
    this.logger.log(
      'Account unfrozen successfully',
      `${GalileoService.name}#unfreezeAccount`,
      requestId,
      data,
    );
  }

  async activateCard({ accountNumber }: ActivateAccountDto) {
    const transactionId = uuidv4();
    try {
      const bodyParams = new url.URLSearchParams({
        apiLogin: this.apiLogin,
        apiTransKey: this.apiTransKey,
        providerId: this.providerId,
        prodId: this.prodId,
        transactionId,
        accountNo: accountNumber,
        type: '7',
      });
      const { data } = await axios.post<Record<string, any>>(
        `${this.baseUrl}/modifyStatus`,
        bodyParams.toString(),
        {
          headers: {
            'response-content-type': 'json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // success
      if (data.status_code === 0) {
        const responseData = data.response_data;
        const rToken = data.rtoken;
      }
      this.logger.log(
        'Card activated successfully',
        GalileoService.name,
        transactionId,
        data,
      );

      return data;
    } catch (error) {
      this.logger.error(
        'Error while trying to activate card',
        GalileoService.name,
        transactionId,
        error,
      );
    }
  }

  // TODO delete this once we start receiving transactions via events
  async simulateCardAuthorization(
    screenTrackingId: string,
    simulateCardAuthorizationDto: SimulateCardAuthorizationDto,
    requestId: string,
  ) {
    const { accountNumber, amount, association, merchantName } =
      simulateCardAuthorizationDto;

    this.logger.log(
      `Simulating card authorization with params:`,
      `${GalileoService.name}#simulateCardAuthorization`,
      requestId,
      { ...simulateCardAuthorizationDto, userId: screenTrackingId },
    );
    const card: Card = await this.cardRepository.findOne({
      screenTracking: screenTrackingId,
      accountNumber,
    });
    if (!card) {
      const errorMessage = `Card for screenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#simulateCardAuthorization`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      amount,
      association,
      merchantName,
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/createSimulatedCardAuth`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.response_data.auth_response_code === '51') {
      const errorMessage = 'Insufficient funds';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#simulateCardAuthorization`,
        requestId,
        data,
      );
      throw new BadRequestException(undefined, errorMessage);
    } else if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#simulateCardAuthorization`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    const responseData = data.response_data;
    const newBalance = card.balance - +amount;
    const transactionTimestamp = new Date().toISOString();
    const transaction: Transactions = this.transactionsRepository.create({
      amount: `-${amount}`,
      authenticationId: responseData.auth_id,
      card,
      postingTimestamp: transactionTimestamp,
      remainingBalance: newBalance,
      responseBody: data,
      status: 'settled',
      transactionDescription: merchantName,
      transactionTimestamp,
      transactionType: 'Visa Settle',
      screenTracking: screenTrackingId,
    });
    await Promise.all([
      this.cardRepository.update(
        { screenTracking: screenTrackingId, accountNumber },
        { balance: newBalance },
      ),
      this.transactionsRepository.save(transaction),
    ]);
    this.logger.log(
      'Simulated card Authorization successfully',
      `${GalileoService.name}#simulateCardAuthorization`,
      requestId,
      data,
    );

    return responseData;
  }

  // TODO delete this once we start receiving transactions via events
  async simulateCardSettle(
    screenTrackingId: string,
    simulateCardSettleDto: SimulateCardSettleDto,
    requestId: string,
  ) {
    const { accountNumber, association, authId } = simulateCardSettleDto;

    this.logger.log(
      `Simulating card settle with params:`,
      `${GalileoService.name}#simulateCardSettle`,
      requestId,
      { ...simulateCardSettleDto, userId: screenTrackingId },
    );
    const screenTracking: ScreenTracking =
      await this.screenTrackingRepository.findOne(screenTrackingId);
    if (!screenTracking) {
      const errorMessage = `ScreenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#simulateCardSettle`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      association,
      authId,
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/createSimulatedCardSettle`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#simulateCardSettle`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    this.logger.log(
      'Simulated card settle successfully',
      `${GalileoService.name}#simulateCardSettle`,
      requestId,
      data,
    );
  }

  async getCards(screenTrackingId: string, requestId: string) {
    this.logger.log(
      `Getting cards for screenTracking id ${screenTrackingId}`,
      GalileoService.name,
      requestId,
    );
    const cards: Card[] = await this.cardRepository.find({
      where: {
        screenTracking: screenTrackingId,
      },
      select: [
        'accountNumber',
        'balance',
        'cardNumber',
        'createdAt',
        'expiryDate',
        'isArchived',
        'isFrozen',
        'id',
        'updatedAt',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
    this.logger.log(
      `Got cards for screenTracking id ${screenTrackingId}`,
      GalileoService.name,
      requestId,
      cards,
    );

    return cards;
  }

  async getAccountOverview(
    screenTrackingId: string,
    accountOverviewDto: AccountOverViewDto,
    requestId: string,
  ) {
    const { accountNumber, from, to } = accountOverviewDto;

    this.logger.log(
      `Getting account overview with params:`,
      `${GalileoService.name}#getAccountOverview`,
      requestId,
      { ...accountOverviewDto, userId: screenTrackingId },
    );
    const screenTracking: ScreenTracking =
      await this.screenTrackingRepository.findOne(screenTrackingId);
    if (!screenTracking) {
      const errorMessage = `ScreenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#getAccountOverview`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      startDate: moment(from).startOf('day').format('YYYY-MM-DD'),
      endDate: moment(to).add(1, 'day').startOf('day').format('YYYY-MM-DD'),
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/getAccountOverview`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#getAccountOverview`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }
    this.logger.log(
      'Got account overview successfully',
      `${GalileoService.name}#getAccountOverview`,
      requestId,
      data,
    );

    return data.response_data;
  }

  async getCard(accountNumber: string) {
    const transactionId = uuidv4();
    try {
      const bodyParams = new url.URLSearchParams({
        apiLogin: this.apiLogin,
        apiTransKey: this.apiTransKey,
        providerId: this.providerId,
        prodId: this.prodId,
        transactionId,
        accountNo: accountNumber,
      });
      const { data } = await axios.post<Record<string, any>>(
        `${this.baseUrl}/getCard`,
        bodyParams.toString(),
        {
          headers: {
            'response-content-type': 'json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // success
      if (data.status_code === 0) {
        const responseData = data.response_data;
        const rToken = data.rtoken;
      }
      this.logger.log(
        'Got card data successfully',
        GalileoService.name,
        transactionId,
        data,
      );

      return data;
    } catch (error) {
      this.logger.error(
        'Error while getting card data',
        GalileoService.name,
        transactionId,
        error,
      );
    }
  }

  async getBalance(accountNumber: string) {
    const transactionId = uuidv4();
    try {
      const bodyParams = new url.URLSearchParams({
        apiLogin: this.apiLogin,
        apiTransKey: this.apiTransKey,
        providerId: this.providerId,
        prodId: this.prodId,
        transactionId,
        accountNo: accountNumber,
      });
      const { data } = await axios.post<Record<string, any>>(
        `${this.baseUrl}/getBalance`,
        bodyParams.toString(),
        {
          headers: {
            'response-content-type': 'json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // success
      if (data.status_code === 0) {
        const responseData = data.response_data;
        const rToken = data.rtoken;
      }
      this.logger.log(
        'Got card balance successfully',
        GalileoService.name,
        transactionId,
        data,
      );

      return data;
    } catch (error) {
      this.logger.error(
        'Error while getting card balance',
        GalileoService.name,
        transactionId,
        error,
      );
    }
  }

  async setCreditLimit(
    screenTrackingId: string,
    setCreditLimitDto: SetCreditLimitDto,
    requestId: string,
  ) {
    const { accountNumber, amount } = setCreditLimitDto;

    this.logger.log(
      `Setting credit limit with params:`,
      `${GalileoService.name}#setCreditLimit`,
      requestId,
      { ...setCreditLimitDto, userId: screenTrackingId },
    );
    const card: Card = await this.cardRepository.findOne({
      screenTracking: screenTrackingId,
      accountNumber,
    });
    if (!card) {
      const errorMessage = `Card for screenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#setCreditLimit`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
      amount,
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/setCreditLimit`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#setCreditLimit`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    this.logger.log(
      'Set credit limit successfully',
      `${GalileoService.name}#setCreditLimit`,
      requestId,
      data,
    );

    return data.response_data;
  }

  async getCreditSummary(
    screenTrackingId: string,
    getCreditSummaryDto: GetCreditSummaryDto,
    requestId: string,
  ) {
    const { accountNumber } = getCreditSummaryDto;

    this.logger.log(
      `Getting credit summary with params:`,
      `${GalileoService.name}#getCreditSummary`,
      requestId,
      { ...getCreditSummaryDto, screenTrackingId },
    );
    const card: Card = await this.cardRepository.findOne({
      screenTracking: screenTrackingId,
      accountNumber,
    });
    if (!card) {
      const errorMessage = `Card for screenTracking id ${screenTrackingId} not found`;
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#getCreditSummary`,
        requestId,
      );
      throw new NotFoundException(undefined, errorMessage);
    }

    const bodyParams = new url.URLSearchParams({
      apiLogin: this.apiLogin,
      apiTransKey: this.apiTransKey,
      providerId: this.providerId,
      prodId: this.prodId,
      transactionId: requestId,
      accountNo: accountNumber,
    });
    const { data } = await axios.post<Record<string, any>>(
      `${this.baseUrl}/getCreditSummary`,
      bodyParams.toString(),
      {
        headers: {
          'response-content-type': 'json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (data.status_code !== 0) {
      const errorMessage = 'Internal Server Error';
      this.logger.error(
        errorMessage,
        `${GalileoService.name}#getCreditSummary`,
        requestId,
        data,
      );
      throw new InternalServerErrorException(undefined, errorMessage);
    }

    this.logger.log(
      'Got credit summary successfully',
      `${GalileoService.name}#getCreditSummary`,
      requestId,
      data,
    );
  }

  async getTransactions(
    screenTrackingId: string,
    cardId: string,
    getTransactionsByDateDto: GetTransactionsByDateDto,
    requestId: string,
  ) {
    this.logger.log(
      `Getting transactions with params:`,
      `${GalileoService.name}#getTransactions`,
      requestId,
      { screenTrackingId, cardId },
    );

    const { startDate, endDate } = getTransactionsByDateDto;
    const transactions: Transactions[] = await this.transactionsRepository.find(
      {
        where: {
          screenTracking: screenTrackingId,
          card: cardId,
          createdAt: MoreThanOrEqual(startDate),
          updatedAt: LessThanOrEqual(endDate),
        },
        order: {
          updatedAt: 'DESC',
        },
      },
    );

    this.logger.log(
      `Got transactions:`,
      `${GalileoService.name}#getTransactions`,
      requestId,
      transactions,
    );

    return transactions;
  }

  async setArchived(
    cardId: string,
    setArchivedDto: SetArchivedDto,
    requestId: string,
  ) {
    this.logger.log(
      `Setting card archived with params:`,
      `${GalileoService.name}#setArchived`,
      requestId,
      { cardId, ...setArchivedDto },
    );

    const result: UpdateResult = await this.cardRepository.update(
      { id: cardId },
      { isArchived: setArchivedDto.archived },
    );
    if (result.affected === 0) {
      this.logger.log(
        `No changes made`,
        `${GalileoService.name}#getTransactions`,
        requestId,
      );
    } else {
      this.logger.log(
        `Card updated successfully`,
        `${GalileoService.name}#getTransactions`,
        requestId,
      );
    }
  }
}
