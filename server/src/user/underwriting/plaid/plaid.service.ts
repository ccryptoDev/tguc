import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { AppService } from '../../../app.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Plaid } from './plaid.entity';
import {
  AssetReportPDFGetRequest,
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
  SandboxPublicTokenCreateRequest,
} from 'plaid';
// import { randomUUID } from 'crypto';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { SendGridService } from '../../../email/services/sendgrid.service';
import Config from '../../../app.config';

@Injectable()
export class PlaidService {
  client: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    @InjectRepository(Plaid)
    private readonly plaidModel: Repository<Plaid>,
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly nunjucksService: NunjucksService,
    private readonly sendGridService: SendGridService,
  ) { }

  async initPlaidClient() {
    const headers = {
      'PLAID-CLIENT-ID': this.configService.get<string>('plaidClientId'),
      'PLAID-SECRET': this.configService.get<string>('plaidSecretKey'),
      'Plaid-Version': this.configService.get<string>('plaidVersion'),
    };

    const configuration = new Configuration({
      basePath:
        PlaidEnvironments[this.configService.get<string>('plaidEnvType')],
      baseOptions: {
        headers,
      },
    });

    if (typeof this.client === 'undefined' || this.client == null) {
      this.client = new PlaidApi(configuration);
    }
  }

  async getAssetReport(user: User) {
    const plaid: Plaid = await this.plaidModel.findOne({ user: user.id });
    const assetReportToken = plaid?.assetReportToken;
    if (!assetReportToken) {
      throw new InternalServerErrorException();
    }
    try {
      const request: AssetReportPDFGetRequest = {
        asset_report_token: assetReportToken,
      };
      const response = await this.client.assetReportPdfGet(request, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      // handle error
      console.log(error);
    }
    return null;
  }

  async createOrRefreshAssetReport(
    user: User,
    requestId: string,
    plaidData: Plaid | null,
  ): Promise<string> {
    if (!plaidData) {
      return null;
    }
    if (this.client === undefined || this.client === null) {
      await this.initPlaidClient();
    }
    try {
      const options = {
        client_report_id: user.id,
        user: {
          client_user_id: user.id,
          first_name: user.firstName,
          middle_name: user.middleName || '',
          last_name: user.lastName,
          email: user.email,
        },
      };
      let response;
      if (!plaidData.assetReportToken) {
        response = await this.client.assetReportCreate({
          access_tokens: [plaidData?.access_token],
          days_requested: 30,
          options,
        });
      } else {
        response = await this.client.assetReportRefresh({
          asset_report_token: plaidData?.assetReportToken,
          days_requested: 30,
          options,
        });
      }
      return response.data?.asset_report_token;
    } catch (error) {
      // handle error
      console.log(error);
    }
    return null;
  }

  async plaidData(userId: string, requestId: string): Promise<Plaid> {
    let plaid: Plaid = await this.plaidModel.findOne({ user: userId });
    if (!plaid) {
      if (this.configService.get<string>('plaidEnvType') === 'sandbox') {
        const res = await this.createSandBoxAccessToken(userId);
        if (res.success) {
          plaid = await this.plaidModel.findOne({ user: userId });
        }
      } else {
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Token plaid data for user: ${userId} not found.`,
            requestId,
          ),
        );
      }
    }
    return plaid;
  }

  async createLinkToken(userId) {
    if (!userId)
      throw new Error('InstitutionService.createLinkToken: userId required');

    await this.initPlaidClient();

    const configs = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: userId,
      },
      client_name: this.configService.get<string>('plaidClientName'),
      products: [Products.Transactions, Products.Assets],
      country_codes: [CountryCode.Us],
      language: 'en',
      secret: this.configService.get<string>('plaidSecretKey'),
      client_id: this.configService.get<string>('plaidClientId'),
    };

    try {
      const createTokenResponse = await this.client.linkTokenCreate(configs);
      this.logger.log(
        'Create token response result for user : ' + userId,
        `${PlaidService.name}#createlinkToken`,
        userId,
        createTokenResponse,
      );
      return createTokenResponse.data;
    } catch (error) {
      this.logger.log(
        'Payment error: ',
        `${PlaidService.name}#createlinkToken`,
        userId,
        error,
      );
      throw error;
    }
  }

  async loginToPlaid(userId, publicToken) {
    if (this.client === undefined || this.client === null) {
      await this.initPlaidClient();
    }
    const tokenResponse = await this.client.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const plaidData: Plaid = await this.plaidModel.findOne({
      user: userId,
    });

    if (plaidData) {
      this.logger.log(
        'plaid empty result: ',
        `${PlaidService.name}#plaidLog`,
        userId,
        {},
      );

      plaidData.access_token = tokenResponse.data.access_token;
      plaidData.public_token = publicToken;
      await this.plaidModel.save(plaidData);
    } else {
      try {
        const startDate = moment().subtract(
          this.configService.get<string>('transactionPeriodDays'),
          'days',
        );
        const endDate = moment();
        const plaid = this.plaidModel.create({
          access_token: tokenResponse.data.access_token,
          public_token: publicToken,
          user: userId,
          start_date: startDate.toDate(),
          end_date: endDate.toDate(),
          totalRevenue: 0,
          totalExpense: 0,
          netIncome: 0,
        });
        await this.plaidModel.save(plaid);
      } catch (e) {
        console.log(e);
      }
    }
    return { success: true };
  }

  async createSandBoxAccessToken(userId: string) {
    try {
      if (this.client === undefined || this.client === null) {
        await this.initPlaidClient();
      }
      const publicTokenRequest: SandboxPublicTokenCreateRequest = {
        institution_id: 'ins_43',
        initial_products: [Products.Transactions, Products.Assets],
      };
      const publicTokenResponse = await this.client.sandboxPublicTokenCreate(
        publicTokenRequest,
      );
      const publicToken = publicTokenResponse.data.public_token;
      return await this.loginToPlaid(userId, publicToken);
    } catch (e) { }
  }

  async getTransactionList(requestId, userId) {
    const plaid: Plaid = await this.plaidData(userId, requestId);
    if (this.client === undefined || this.client === null) {
      await this.initPlaidClient();
    }
    const user = await this.userModel.findOne({ id: userId });
    const assetReportToken = await this.createOrRefreshAssetReport(
      user,
      requestId,
      plaid,
    );
    if (assetReportToken) {
      plaid.assetReportToken = assetReportToken;
      await this.plaidModel.save(plaid);
    }
    const startDate = moment().subtract(
      this.configService.get<string>('transactionPeriodDays'),
      'days',
    );
    const endDate = moment();
    const configs = {
      access_token: plaid.access_token,
      start_date: startDate.format('YYYY-MM-DD'),
      end_date: endDate.format('YYYY-MM-DD'),
      options: {
        count: 500,
        offset: 0,
      },
    };
    try {
      this.logger.log(
        'plaidTransactionRequest: ',
        `${PlaidService.name}#getTransactionList`,
        userId,
        configs,
      );
      const transactionsResponse = await this.client.transactionsGet(configs);
      this.logger.log(
        'plaidTransactionResponse: ',
        `${PlaidService.name}#getTransactionList`,
        userId,
        transactionsResponse,
      );

      plaid.transactions = transactionsResponse.data.transactions;
      plaid.start_date = startDate.toDate();
      plaid.end_date = endDate.toDate();
      plaid.createdAt = endDate.toDate();

      await this.plaidModel.save(plaid);

      return {
        transactions: transactionsResponse.data.transactions,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PlaidService.name}#getTransactionListServiceError`,
        userId,
        error,
      );

      const errorMsg = error.message;

      throw new InternalServerErrorException(
        this.appService.errorHandler(500, errorMsg, requestId),
      );
    }
  }

  async sendWelcomeEmail(userId: string, requestId: string) {
    const user: User = await this.userModel.findOne({
      id: userId,
    });
    if (!user) {
      return false;
    }
    const applicationNo = user.userReference.replace('USR_', '');
    const html: string = await this.nunjucksService.htmlToString(
      'emails/new-application-email-borrower.html',
      {
        userName: `${user.firstName} ${user.lastName}`,
        applicationNo,
        baseUrl: Config().baseUrl,
      },
    );
    const fromName = this.configService.get<string>('sendGridFromName');
    const fromEmail = this.configService.get<string>('sendGridFromEmail');
    await this.sendGridService.sendEmail(
      `${fromName} <${fromEmail}>`,
      user.email,
      `TGUC credit application #${applicationNo}`,
      html,
      requestId,
    );
    return true;
  }
}
