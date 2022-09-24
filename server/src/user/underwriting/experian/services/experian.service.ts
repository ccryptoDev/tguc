import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoggerService } from '../../../../logger/services/logger.service';
import { User } from '../../../entities/user.entity';
import { ScreenTracking } from '../../../screen-tracking/entities/screen-tracking.entity';
import { AppService } from '../../../../app.service';

import axios, { AxiosRequestConfig } from 'axios';

import moment from 'moment';
import { Experian } from '../entities/experian.entity';
import { ExperianHistory } from '../entities/experian-history.entity';

@Injectable()
export class ExperianService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,

    @InjectRepository(ExperianHistory)
    private readonly experianHistoryModel: Repository<ExperianHistory>,
  ) {}

  /**
   * retrieve  access token for future request
   */
  async getAccessToken(requestId: string) {
    const exp_url = this.configService.get<string>('exp_url');

    const requestData = {
      username: this.configService.get<string>('exp_username'),
      password: this.configService.get<string>('exp_password'),
      client_id: this.configService.get<string>('exp_client_id'),
      client_secret: this.configService.get<string>('exp_client_secret'),
    };

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${exp_url}/oauth2/v1/token`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: requestData,
    };
    const { status, data } = (await axios(options)) as Record<string, any>;

    if (status !== 200) {
      const { Status, ResponseCode, Message } = data;
      this.logger.error(
        `Error ${Message}:`,
        `${ExperianService.name}#getAccessToken`,
        requestId,
        { status, ...(data as Record<string, any>) },
      );
      throw new BadRequestException({
        statusCode: 400,
        status: Status,
        message: Message,
        responseCode: ResponseCode,
        requestId,
      });
    }

    this.logger.log(
      'Experian access token',
      `${ExperianService.name}#getAccessToken`,
      requestId,
      data,
    );

    return data.access_token;
  }

  /**
   * retrieve  access token for future request
   */
  async creditReportInquiry(
    screenTracking: ScreenTracking,
    user: User,
    requestId: string,
  ) {
    const access_token = await this.getAccessToken(requestId);

    const exp_url = this.configService.get<string>('exp_url');
    const exp_subscriber_code = this.configService.get<string>(
      'exp_subscriber_code',
    );

    const requestData = {
      consumerPii: {
        primaryApplicant: {
          name: {
            lastName: user.lastName,
            firstName: user.firstName,
            middleName: user.middleName || '',
          },
          dob: {
            dob: moment(user.dateOfBirth).format('MMDDYYYY'),
          },
          ssn: {
            ssn: user.ssnNumber,
          },
          currentAddress: {
            line1: user.street,
            line2: '',
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
          },
        },
      },
      requestor: {
        subscriberCode: exp_subscriber_code,
      },
    };

    this.logger.log(
      'Experian credit report request:',
      `${ExperianService.name}#creditReportInquiry`,
      requestId,
      requestData,
    );

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${exp_url}/v2/credit-report`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      data: requestData,
    };
    const { status, data } = (await axios(options)) as Record<string, any>;

    this.logger.log(
      'Experian credit report response:',
      `${ExperianService.name}#creditReportInquiry`,
      requestId,
      data,
    );

    if (status !== 200) {
      const { Status, ResponseCode, Message } = data;
      //const err = new Error( response.statusMessage );
      //err.code = response.statusCode;
      this.logger.error(
        `Error ${Message}:`,
        `${ExperianService.name}#getAccessToken`,
        requestId,
        { status, ...(data as Record<string, any>) },
      );
      throw new BadRequestException({
        statusCode: 400,
        status: Status,
        message: Message,
        responseCode: ResponseCode,
        requestId,
      });
    }

    const report =
      data.hasOwnProperty('creditProfile') &&
      Array.isArray(data.creditProfile) &&
      data.creditProfile.length
        ? data.creditProfile[0]
        : {};
    const consumerIdentity =
      report.hasOwnProperty('consumerIdentity') &&
      typeof report.consumerIdentity === 'object' &&
      report.consumerIdentity !== null
        ? report.consumerIdentity
        : null;
    const firstIdentity =
      consumerIdentity !== null &&
      consumerIdentity.hasOwnProperty('name') &&
      Array.isArray(consumerIdentity.name) &&
      consumerIdentity.name.length > 0
        ? consumerIdentity.name[0]
        : null;
    const employmentInformation =
      report.hasOwnProperty('employmentInformation') &&
      Array.isArray(report.employmentInformation)
        ? report.employmentInformation
        : null;
    const addressInformation =
      report.hasOwnProperty('addressInformation') &&
      Array.isArray(report.addressInformation)
        ? report.addressInformation
        : null;
    const inquiry =
      report.hasOwnProperty('inquiry') && Array.isArray(report.inquiry)
        ? report.inquiry
        : null;
    const ssn =
      report.hasOwnProperty('ssn') && Array.isArray(report.ssn)
        ? report.ssn
        : null;
    const tradeline =
      report.hasOwnProperty('tradeline') && Array.isArray(report.tradeline)
        ? report.tradeline
        : null;
    const fraudShield =
      report.hasOwnProperty('fraudShield') && Array.isArray(report.fraudShield)
        ? report.fraudShield
        : null;
    const informationalMessage =
      report.hasOwnProperty('informationalMessage') &&
      Array.isArray(report.informationalMessage)
        ? report.informationalMessage
        : null;
    const riskModel =
      report.hasOwnProperty('riskModel') && Array.isArray(report.riskModel)
        ? report.riskModel
        : null;
    const consumerAssistanceReferralAddress = report.hasOwnProperty(
      'consumerAssistanceReferralAddress',
    )
      ? report.consumerAssistanceReferralAddress
      : null;
    const directCheck =
      report.hasOwnProperty('directCheck') && Array.isArray(report.directCheck)
        ? report.directCheck
        : null;
    const mla = report.hasOwnProperty('mla') ? report.mla : null;
    const ofac = report.hasOwnProperty('ofac') ? report.ofac : null;
    const summaries =
      report.hasOwnProperty('summaries') && Array.isArray(report.summaries)
        ? report.summaries
        : null;
    const _publicRecord =
      report.hasOwnProperty('publicRecord') &&
      Array.isArray(report.publicRecord)
        ? report.publicRecord
        : null;
    const statement =
      report.hasOwnProperty('statement') && Array.isArray(report.statement)
        ? report.statement
        : null;
    const uniqueConsumerIdentifier = report.hasOwnProperty(
      'uniqueConsumerIdentifier',
    )
      ? report.uniqueConsumerIdentifier
      : null;
    const extendedViewAttributes =
      report.hasOwnProperty('extendedViewAttributes') &&
      Array.isArray(report.extendedViewAttributes)
        ? report.extendedViewAttributes
        : null;
    const premierAttributes =
      report.hasOwnProperty('premierAttributes') &&
      Array.isArray(report.premierAttributes)
        ? report.premierAttributes
        : null;
    const trendedAttributes =
      report.hasOwnProperty('trendedAttributes') &&
      Array.isArray(report.trendedAttributes)
        ? report.trendedAttributes
        : null;
    const trendView =
      report.hasOwnProperty('trendView') && Array.isArray(report.trendView)
        ? report.trendView
        : null;
    const modelAttributes =
      report.hasOwnProperty('modelAttributes') &&
      Array.isArray(report.modelAttributes)
        ? report.modelAttributes
        : null;
    const staggAttributes =
      report.hasOwnProperty('staggAttributes') &&
      Array.isArray(report.staggAttributes)
        ? report.staggAttributes
        : null;
    const customAttributes =
      report.hasOwnProperty('customAttributes') &&
      Array.isArray(report.customAttributes)
        ? report.customAttributes
        : null;

    const experianDoc = {
      user: user.id,
      first_name: firstIdentity !== null ? firstIdentity.firstName : '',
      middle_name: firstIdentity !== null ? firstIdentity.middleName : '',
      last_name: firstIdentity !== null ? firstIdentity.surname : '',
      generationCode:
        firstIdentity !== null ? firstIdentity.generationCode : '',
      score:
        riskModel !== null && riskModel.length > 0 ? riskModel[0].score : '',
      addressInformation: addressInformation,
      consumerAssistanceReferralAddress: consumerAssistanceReferralAddress,
      consumerIdentity: consumerIdentity,
      customAttributes: customAttributes,
      directCheck: directCheck,
      employmentInformation: employmentInformation,
      extendedViewAttributes: extendedViewAttributes,
      fraudShield: fraudShield,
      informationalMessage: informationalMessage,
      inquiry: inquiry,
      mla: mla,
      modelAttributes: modelAttributes,
      ofac: ofac,
      premierAttributes: premierAttributes,
      publicRecord: _publicRecord,
      ssn: ssn,
      staggAttributes: staggAttributes,
      statement: statement,
      summaries: summaries,
      riskModel: riskModel,
      tradeline: tradeline,
      trendedAttributes: trendedAttributes,
      trendView: trendView,
      uniqueConsumerIdentifier: uniqueConsumerIdentifier,
      status: 0,
    };

    await this.experianHistoryModel.create({
      createdAt: Date(),
      requestData: requestData,
      responseData: data,
      report: experianDoc,
      status: 0,
      user: user,
      screenTracking: screenTracking,
    });

    return experianDoc;
  }
}
