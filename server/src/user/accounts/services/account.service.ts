import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';

import { LoggerService } from '../../../logger/services/logger.service';
import { Account } from '../entities/account.entity';
import { AddAccountDto } from '../validation/add-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsModel: Repository<Account>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async addAccount(addAccountDto: AddAccountDto, requestId: string) {
    this.logger.log(
      'Creating new account with params:',
      `${AccountsService.name}.createNewUser`,
      requestId,
      addAccountDto,
    );
    const { institution, loginId, screenTrackingId, userId } = addAccountDto;

    const existingAccount = await this.accountsModel.findOne({
      screenTracking: screenTrackingId,
    });
    if (existingAccount) {
      const response = { accountId: existingAccount.id };
      this.logger.log(
        'Returning existing account.',
        `${AccountsService.name}#createNewUser`,
        requestId,
        response,
      );
      return response;
    }

    const newAccount = {
      user: userId,
      screenTracking: screenTrackingId,
      loginId,
      institution,
    };
    let account: Account = this.accountsModel.create(newAccount);
    account = await this.accountsModel.save(account);
    this.fetchAccountDetails(account.id, loginId, requestId);

    const response = {
      accountId: account.id,
    };
    this.logger.log(
      'Created account.',
      `${AccountsService.name}#createNewUser`,
      requestId,
      response,
    );

    return response;
  }

  async getUserAccountsByScreenTrackingId(
    screenTrackingId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting user account by screen tracking id with params:',
      `${AccountsService.name}#createNewUser`,
      requestId,
      screenTrackingId,
    );

    const response = await this.accountsModel.findOne({
      screenTracking: screenTrackingId,
    });
    this.logger.log(
      'Got user account:',
      `${AccountsService.name}#createNewUser`,
      requestId,
      response,
    );

    return response;
  }

  async fetchAccountDetails(
    accountId: string,
    loginId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Fetching account details with params:',
      `${AccountsService.name}.fetchAccountDetails`,
      requestId,
      { accountId, loginId },
    );
    // exchange loginId for RequestId
    const instance = this.configService.get<string>('instance');
    const customerId = this.configService.get<string>('customerId');
    try {
      const { data: authorizeResponse } = await axios.post<any>(
        `https://${instance}-api.private.fin.ag/v3/${customerId}/BankingServices/Authorize`,
        { LoginId: loginId, MostRecentCached: true },
      );

      const flinksRequestId: string = authorizeResponse.RequestId;
      this.logger.log(
        'Flinks authorize request id:',
        `${AccountsService.name}.fetchAccountDetails`,
        requestId,
        { accountId, loginId, flinksRequestId },
      );

      const { data: accountsDetailResponse } = await axios.post<any>(
        `https://${instance}-api.private.fin.ag/v3/${customerId}/BankingServices/GetAccountsDetail`,
        {
          RequestId: flinksRequestId,
        },
      );
      if (accountsDetailResponse.HttpStatusCode === 202) {
        this.logger.log(
          'Flinks HTTPStatusCode 202, setting fetch job:',
          `${AccountsService.name}.fetchAccountDetails`,
          requestId,
          { accountId, loginId, flinksRequestId },
        );
        const intervalId = setInterval(async () => {
          try {
            const response: any = await axios.get(
              `https://${instance}-api.private.fin.ag/v3/${customerId}/BankingServices/GetAccountsDetailAsync/${flinksRequestId}`,
            );
            const { data } = response;
            if (data.HttpStatusCode === 200) {
              this.logger.log(
                'Got account details:',
                `${AccountsService.name}.fetchAccountDetails`,
                requestId,
                data,
              );
              await this.accountsModel.update(
                { id: accountId },
                {
                  accounts: data.Accounts,
                },
              );
              clearInterval(intervalId);
              await this.fetchAttributes(
                accountId,
                loginId,
                flinksRequestId,
                requestId,
              );
            }
          } catch (error) {
            clearInterval(intervalId);
            this.logger.error(
              'Error:',
              `${AccountsService.name}.fetchAccountDetails`,
              requestId,
              error,
            );
          }
        }, 30000);
      } else if (accountsDetailResponse.HttpStatusCode === 200) {
        this.logger.log(
          'Got account details:',
          `${AccountsService.name}.fetchAccountDetails`,
          requestId,
          accountsDetailResponse,
        );
        await this.accountsModel.update(
          { id: accountId },
          {
            accounts: accountsDetailResponse.Accounts,
          },
        );
        await this.fetchAttributes(
          accountId,
          loginId,
          flinksRequestId,
          requestId,
        );
      } else {
        this.logger.error(
          'Error:',
          `${AccountsService.name}.fetchAccountDetails`,
          requestId,
          accountsDetailResponse,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AccountsService.name}.fetchAccountDetails`,
        requestId,
        error,
      );
    }
  }

  async fetchAttributes(
    accountId: string,
    loginId: string,
    flinksRequestId: string,
    requestId: string,
  ) {
    return Promise.all([
      this.fetchIncomeAttributes(
        accountId,
        loginId,
        flinksRequestId,
        requestId,
      ),
      this.fetchCreditRiskAttributes(
        accountId,
        loginId,
        flinksRequestId,
        requestId,
      ),
      this.fetchUserAnalysisAttributes(
        accountId,
        loginId,
        flinksRequestId,
        requestId,
      ),
    ]);
  }

  async fetchIncomeAttributes(
    accountId: string,
    loginId: string,
    flinksRequestId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting income attributes with params:',
      `${AccountsService.name}.fetchCreditRiskAttributes`,
      requestId,
      { accountId, loginId, flinksRequestId },
    );

    const instance = this.configService.get<string>('instance');
    const customerId = this.configService.get<string>('customerId');
    const getIncomeAttributesUrl = `https://${instance}-api.private.fin.ag/v3/${customerId}/insight/login/${loginId}/attributes/${flinksRequestId}/GetIncomeAttributes`;
    try {
      const { data } = await axios.get<any>(getIncomeAttributesUrl);
      if (data.HttpStatusCode === 202) {
        const intervalId = setInterval(async () => {
          try {
            const { data } = await axios.get<any>(getIncomeAttributesUrl);
            if (data.HttpStatusCode === 200) {
              this.logger.log(
                'Got account details:',
                `${AccountsService.name}.fetchIncomeAttributes`,
                requestId,
                data,
              );
              await this.accountsModel.update(
                { id: accountId },
                {
                  incomeAttributes: data.Card,
                },
              );
              clearInterval(intervalId);
            }
          } catch (error) {
            clearInterval(intervalId);
            this.logger.error(
              'Error:',
              `${AccountsService.name}.fetchIncomeAttributes`,
              requestId,
              error,
            );
          }
        }, 30000);
      } else if (data.HttpStatusCode === 200) {
        this.logger.log(
          'Got account details:',
          `${AccountsService.name}.fetchIncomeAttributes`,
          requestId,
          data,
        );
        await this.accountsModel.update(
          { id: accountId },
          {
            incomeAttributes: data.Card,
          },
        );
      } else {
        this.logger.error(
          'Error:',
          `${AccountsService.name}.fetchIncomeAttributes`,
          requestId,
          data,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AccountsService.name}.fetchIncomeAttributes`,
        requestId,
        error,
      );
    }
  }

  async fetchCreditRiskAttributes(
    accountId: string,
    loginId: string,
    flinksRequestId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting credit risk attributes with params:',
      `${AccountsService.name}.fetchCreditRiskAttributes`,
      requestId,
      { accountId, loginId, flinksRequestId },
    );

    const instance = this.configService.get<string>('instance');
    const customerId = this.configService.get<string>('customerId');
    const getCreditRiskAttributesURL = `https://${instance}-api.private.fin.ag/v3/${customerId}/insight/login/${loginId}/attributes/${flinksRequestId}/GetCreditRiskAttributes`;

    try {
      const { data } = await axios.get<any>(getCreditRiskAttributesURL);
      if (data.HttpStatusCode === 202) {
        const intervalId = setInterval(async () => {
          try {
            const { data } = await axios.get<any>(getCreditRiskAttributesURL);
            if (data.HttpStatusCode === 200) {
              this.logger.log(
                'Got credit risk attributes:',
                `${AccountsService.name}.fetchCreditRiskAttributes`,
                requestId,
                data,
              );
              await this.accountsModel.update(
                { id: accountId },
                {
                  creditRiskAttributes: data.Card,
                },
              );
              clearInterval(intervalId);
            }
          } catch (error) {
            clearInterval(intervalId);
            this.logger.error(
              'Error:',
              `${AccountsService.name}.fetchCreditRiskAttributes`,
              requestId,
              error,
            );
          }
        }, 30000);
      } else if (data.HttpStatusCode === 200) {
        this.logger.log(
          'Got credit risk attributes:',
          `${AccountsService.name}.fetchCreditRiskAttributes`,
          requestId,
          data,
        );
        await this.accountsModel.update(
          { id: accountId },
          {
            creditRiskAttributes: data.Card,
          },
        );
      } else {
        this.logger.error(
          'Error:',
          `${AccountsService.name}.fetchCreditRiskAttributes`,
          requestId,
          data,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AccountsService.name}.fetchCreditRiskAttributes`,
        requestId,
        error,
      );
    }
  }

  async fetchUserAnalysisAttributes(
    accountId: string,
    loginId: string,
    flinksRequestId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting user analysis attributes with params:',
      `${AccountsService.name}.fetchUserAnalysisAttributes`,
      requestId,
      { accountId, loginId, flinksRequestId },
    );
    const instance = this.configService.get<string>('instance');
    const customerId = this.configService.get<string>('customerId');
    const getUserAnalysisAttributesUrl = `https://${instance}-api.private.fin.ag/v3/${customerId}/insight/login/${loginId}/attributes/${flinksRequestId}/GetUserAnalysisAttributes`;

    try {
      const { data } = await axios.get<any>(getUserAnalysisAttributesUrl);
      if (data.HttpStatusCode === 202) {
        const intervalId = setInterval(async () => {
          const { data } = await axios.get<any>(getUserAnalysisAttributesUrl);
          if (data.HttpStatusCode === 200) {
            this.logger.log(
              'Got user analysis attributes:',
              `${AccountsService.name}.fetchUserAnalysisAttributes`,
              requestId,
              data,
            );
            await this.accountsModel.update(
              { id: accountId },
              {
                userAnalysisAttributes: data.Card,
              },
            );
            clearInterval(intervalId);
          }
        }, 30000);
      } else if (data.HttpStatusCode === 200) {
        this.logger.log(
          'Got user analysis attributes:',
          `${AccountsService.name}.fetchUserAnalysisAttributes`,
          requestId,
          data,
        );
        await this.accountsModel.update(
          { id: accountId },
          {
            userAnalysisAttributes: data.Card,
          },
        );
      } else {
        this.logger.error(
          'Error:',
          `${AccountsService.name}.fetchUserAnalysisAttributes`,
          requestId,
          data,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AccountsService.name}.fetchUserAnalysisAttributes`,
        requestId,
        error,
      );
    }
  }
}
