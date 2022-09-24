import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import path from 'path';
import fs from 'fs-extra';
import xml2js from 'xml2js';
import https from 'https';
import moment from 'moment';
import axios, { AxiosResponse } from 'axios';
import parseAddress = require('parse-address');

import { TransUnionHistory } from '../entities/transunion-history.entity';
import { TransUnion } from '../entities/transunion.entity';
import { LoggerService } from '../../../../logger/services/logger.service';
import { User } from '../../../entities/user.entity';
import { ScreenTracking } from '../../../screen-tracking/entities/screen-tracking.entity';
import { AppService } from '../../../../app.service';

type TransUnionCredentials = {
  certificate: Record<string, unknown>;
  processingEnvironment: string;
  industryCode: string;
  memberCode: string;
  password: string;
  prefixCode: string;
  url: string;
  version: string;
};

@Injectable()
export class TransunionService {
  constructor(
    @InjectRepository(TransUnionHistory)
    private readonly transUnionHistoryModel: Repository<TransUnionHistory>,
    @InjectRepository(TransUnion)
    private readonly transUnionsModel: Repository<TransUnion>,
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * build request data object
   * @param credentials TransUnion credentials
   * @param user User document
   */
  buildRequestDataObj(
    credentials: TransUnionCredentials,
    user: User,
    requestId: string,
  ) {
    this.logger.log(
      'Building TransUnion request data object with params:',
      `${TransunionService.name}#buildRequestDataObj`,
      requestId,
      user,
    );
    const addressObj =
      user.street && user.city && user.state && user.zipCode
        ? parseAddress.parseLocation(
            `${user.street}, ${user.city}, ${user.state} ${user.zipCode}`,
          )
        : null;
    let street: any;
    if (
      addressObj &&
      addressObj.number &&
      addressObj.prefix &&
      addressObj.street &&
      addressObj.type
    ) {
      street = {
        number: addressObj.number,
        preDirectional: addressObj.prefix,
        name: addressObj.street,
        type: addressObj.type,
      };
    } else {
      street = { name: user.street };
    }
    const subjectRecord: any = {
      indicative: {
        name: {
          person: {
            first: user.firstName,
            middle: user.middleName,
            last: user.lastName,
          },
        },
        address: {
          status: 'current',
          street: street,
          location: {
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
          },
        },
      },
      addOnProduct: {
        code: '00V60',
        scoreModelProduct: 'true',
      },
    };
    const ssn = user.ssnNumber ? user.ssnNumber.replace(/[^0-9]/g, '') : null;
    if (ssn)
      subjectRecord.indicative.socialSecurity = {
        number: String(ssn).padStart(9, '0'),
      };
    const dateOfBirth = user.dateOfBirth
      ? moment(user.dateOfBirth, 'YYYY-MM-DD').format('YYYY-MM-DD')
      : null;
    if (dateOfBirth) subjectRecord.indicative.dateOfBirth = dateOfBirth;

    const response = {
      document: 'request',
      version: credentials.version,
      transactionControl: {
        userRefNumber: user.id,
        subscriber: {
          industryCode: credentials.industryCode,
          inquirySubscriberPrefixCode: credentials.prefixCode,
          memberCode: credentials.memberCode,
          password: credentials.password,
        },
        options: {
          contractualRelationship: 'individual',
          country: 'us',
          language: 'en',
          pointOfSaleIndicator: 'none',
          processingEnvironment: credentials.processingEnvironment,
        },
      },
      product: {
        code: this.configService.get<string>('productCode'),
        subject: { number: '1', subjectRecord },
        responseInstructions: { returnErrorText: 'true', document: null },
        permissiblePurpose: { inquiryECOADesignator: 'individual' },
      },
    };
    this.logger.log(
      'Built TransUnion request data object:',
      `${TransunionService.name}#buildRequestDataObj`,
      requestId,
      response,
    );

    return response;
  }

  /**
   * build transUnions
   * @param creditReport TransUnion credit report
   * @param user User document
   */
  buildTransUnions(creditReport: any, user: User, requestId: string) {
    this.logger.log(
      'Building transUnions with params:',
      `${TransunionService.name}#buildTransUnions`,
      requestId,
      { creditReport, user },
    );
    if (!creditReport.product?.subject?.subjectRecord) {
      this.logger.error(
        'Building transUnions with params:',
        `${TransunionService.name}#buildTransUnions`,
        requestId,
        { creditReport, user },
      );
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          'Could not build transUnions, subjectRecord property is invalid',
          requestId,
        ),
      );
    }
    const subjectRecord = creditReport.product.subject.subjectRecord;

    let name = subjectRecord.indicative?.name;
    if (name && !Array.isArray(name)) {
      name = [name];
    }
    const transUnions = {
      addOnProduct: subjectRecord.addOnProduct,
      creditCollection: subjectRecord.custom?.credit?.collection,
      employment: subjectRecord.indicative?.employment,
      firstName: name[0].person?.first || user.firstName,
      houseNumber: subjectRecord.indicative?.address || user.street,
      inquiry: subjectRecord.custom?.credit?.inquiry,
      isNoHit: subjectRecord.fileSummary?.fileHitIndicator !== 'regularHit',
      isOfac: subjectRecord.addOnProduct?.ofacNameScreen ? true : false,
      isMil: subjectRecord.addOnProduct?.militaryLendingActSearch
        ? true
        : false,
      lastName: name[0].person?.last || user.lastName,
      middleName: name[0].person?.middle || user.middleName,
      publicRecord: subjectRecord.custom?.credit?.publicRecord,
      response: creditReport,
      score: '',
      socialSecurity:
        subjectRecord.indicative?.socialSecurity?.number || user.ssnNumber,
      status: 0,
      trade: subjectRecord.custom?.credit?.trade,
      user: user.id,
    };
    if (!Array.isArray(transUnions.houseNumber)) {
      transUnions.houseNumber = [transUnions.houseNumber];
    }
    if (!Array.isArray(transUnions.employment)) {
      transUnions.employment = [transUnions.employment];
    }
    if (!Array.isArray(transUnions.trade)) {
      transUnions.trade = [transUnions.trade];
    }
    if (!Array.isArray(transUnions.creditCollection)) {
      transUnions.creditCollection = [transUnions.creditCollection];
    }
    if (!Array.isArray(transUnions.publicRecord)) {
      transUnions.publicRecord = [transUnions.publicRecord];
    }
    if (!Array.isArray(transUnions.inquiry)) {
      transUnions.inquiry = [transUnions.inquiry];
    }
    if (!Array.isArray(transUnions.addOnProduct)) {
      transUnions.addOnProduct = [transUnions.addOnProduct];
    }

    /**
     * sometimes we get a + back for the credit
     * score so we need to add a 0 in that case
     * so everything doesn't break
     **/
    transUnions.addOnProduct = transUnions.addOnProduct.map((product: any) => {
      const code = product?.code;
      if (
        ['001NN', '00V60', '00N94', '00P94', '00W18', '00Q88', '00P02'].indexOf(
          code,
        ) >= 0
      ) {
        let score = product?.scoreModel?.score?.results;
        if (score && score === '+') {
          score = '+0';
        }
        if (product?.scoreModel?.score?.results) {
          product.scoreModel.score.results = score;
        }
      }

      return product;
    });
    transUnions.addOnProduct.some((product: any) => {
      const code = product?.code;
      if (
        ['001NN', '00V60', '00N94', '00P94', '00W18', '00Q88', '00P02'].indexOf(
          code,
        ) >= 0
      ) {
        transUnions.score = product?.scoreModel?.score?.results;
        if (transUnions.score) {
          return true;
        }
      }
    });
    this.logger.log(
      'TransUnions built:',
      `${TransunionService.name}#buildTransUnions`,
      requestId,
      transUnions,
    );

    return transUnions;
  }

  /**
   * get transunion credentials
   * @param hardPull flag to run a hard or soft credit report
   */
  getCredentials(hardPull: boolean): TransUnionCredentials {
    const credentials = {
      certificate:
        this.configService.get<Record<string, unknown>>('certificate'),
      processingEnvironment: this.configService.get<string>(
        'processingEnvironment',
      ),
      industryCode: this.configService.get<string>('industryCode'),
      memberCode: this.configService.get<string>('memberCode'),
      password: this.configService.get<string>('password'),
      prefixCode: this.configService.get<string>('prefixCode'),
      url: this.configService.get<string>('url'),
      version: this.configService.get<string>('version'),
    };
    if (hardPull)
      credentials.memberCode =
        this.configService.get<string>('memberCodeHardPull');

    return credentials;
  }

  getMonthlyTradeDebt(trades: any[], requestId: string) {
    this.logger.log(
      'Getting monthly trade debt with params:',
      `${TransunionService.name}#getMonthlyTradeDebt`,
      requestId,
      { trades },
    );
    let tradeBalance = 0;
    if (!Array.isArray(trades)) {
      return tradeBalance;
    }

    trades.forEach((trade) => {
      const industryCode = '' + trade?.subscriber?.industryCode?.toUpperCase();
      const ecoa = trade?.ECOADesignator
        ? '' + trade?.ECOADesignator.toLowerCase()
        : 'undesignated';
      if (
        ecoa === 'authorizeduser' ||
        ecoa === 'terminated' ||
        ecoa === 'deceased'
      ) {
        return; // "undesignated","individual","jointcontractliability","authorizeduser","participant","cosigner","primary","terminated","deceased"
      }

      const currentBalance = trade?.currentBalance
        ? parseInt(trade.currentBalance)
        : 0;
      if (industryCode !== 'M') {
        const dateClosed = trade?.dateClosed;
        const datePaidOut = trade?.datePaidOut;
        let scheduledMonthlyPayment = 0;
        if (trade?.terms && trade?.terms.scheduledMonthlyPayment) {
          scheduledMonthlyPayment = parseFloat(
            trade.terms.scheduledMonthlyPayment,
          );
        }

        if (dateClosed || datePaidOut || currentBalance === 0) {
          return;
        }
        tradeBalance = parseFloat(
          (tradeBalance + scheduledMonthlyPayment).toFixed(2),
        );
      }
    });
    this.logger.log(
      'Got monthly trade debts:',
      `${TransunionService.name}#getMonthlyTradeDebt`,
      requestId,
      tradeBalance,
    );

    return tradeBalance;
  }

  /**
   * Pull a hard or soft credit report
   * @param hardPull Whether to perform a hard pull or soft pull
   * @param screenTracking User's screen tracking document
   * @param user User's document
   */
  async runCreditReport(
    hardPull: boolean,
    screenTracking: ScreenTracking,
    user: User,
    requestId: string,
  ) {
    this.logger.log(
      'Running credit report with params:',
      `${TransunionService.name}#runCreditReport`,
      requestId,
      { hardPull, screenTracking, user },
    );
    const logFilePath = path.resolve(
      __dirname,
      `../logs/transunion/${user.id}.txt`,
    );
    await fs.ensureFile(logFilePath);

    let transUnionHistory: TransUnionHistory;
    let transUnionResponse: any;
    const credentials = this.getCredentials(hardPull);
    const requestData = this.buildRequestDataObj(credentials, user, requestId);
    const builder = new xml2js.Builder();
    const xmlData = builder
      .buildObject(requestData)
      .replace(/\n|\r|\s/g, '')
      .replace('\ufeff', '')
      .replace(
        '<?xmlversion="1.0"encoding="UTF-8"standalone="yes"?><root>',
        '<?xml version="1.0" encoding="UTF-8"?><creditBureau xmlns="http://www.transunion.com/namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.transunion.com/namespace">',
      )
      .replace('</root>', '</creditBureau>');
    this.logger.log(
      'Built Transunion xml request: ',
      `${TransunionService.name}#runCreditReport`,
      requestId,
      xmlData,
    );
    await fs.appendFile(
      logFilePath,
      `Request: ${this.configService.get<string>('url')}\n${xmlData}\n`,
    );

    const parser = new xml2js.Parser({
      ignoreAttrs: false,
      mergeAttrs: true,
      charkey: '_',
      explicitArray: false,
    });

    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(
        path.resolve(
          __dirname,
          `../../../../../../${credentials.certificate.crtPath}`,
        ),
        'utf8',
      ),
      key: fs.readFileSync(
        path.resolve(
          __dirname,
          `../../../../../../${credentials.certificate.keyPath}`,
        ),
        'utf8',
      ),
      passphrase: credentials.certificate.password as string,
      rejectUnauthorized: false,
    });

    let response: AxiosResponse<any>;
    try {
      response = await axios.post(
        this.configService.get<string>('url'),
        xmlData,
        {
          httpsAgent,
          headers: { 'Content-Type': 'text/xml', Accept: 'text/xml' },
        },
      );
      this.logger.log(
        'TransUnion response',
        `${TransunionService.name}#runCreditReport`,
        requestId,
        {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
          body: response.data,
        },
      );

      try {
        transUnionResponse = await parser.parseStringPromise(response.data);
        this.logger.log(
          'Parsed TransUnion response: ',
          `${TransunionService.name}#runCreditReport`,
          requestId,
          transUnionResponse,
        );
        transUnionHistory = this.transUnionHistoryModel.create({
          user: user.id,
          requestData,
          status: 1,
          responseData: transUnionResponse,
        });
        transUnionHistory = await this.transUnionHistoryModel.save(
          transUnionHistory,
        );
      } catch (error) {
        this.logger.error(
          'Error:',
          `${TransunionService.name}#runCreditReport`,
          requestId,
          error,
        );
        transUnionHistory = this.transUnionHistoryModel.create({
          user: user.id,
          requestData,
          status: 3,
          responseData: error,
        });
        transUnionHistory = await this.transUnionHistoryModel.save(
          transUnionHistory,
        );

        return {
          screenTracking,
          success: false,
          transUnionHistory,
        };
      }

      if (!response.data || response.status !== 200) {
        if (response.data.status !== 200) {
          transUnionHistory = this.transUnionHistoryModel.create({
            user: user.id,
            requestData,
            status: 2,
            responseData: response.data,
          });
        }
        transUnionHistory = await this.transUnionHistoryModel.save(
          transUnionHistory,
        );

        return {
          screenTracking,
          success: false,
          transUnionHistory,
        };
      }
    } catch (error) {
      let errorToReturn: any = {};
      if (error.response?.data) {
        const parser = new xml2js.Parser({ trim: true });
        errorToReturn = await parser.parseStringPromise(error.response.data);
      } else {
        errorToReturn = error.message;
      }
      fs.appendFileSync(
        logFilePath,
        `Error:\n${JSON.stringify(errorToReturn)}\n`,
      );
      this.logger.error(
        'Error:',
        `${TransunionService.name}#runCreditReport`,
        requestId,
        error,
      );
      if (
        errorToReturn.error?.errortext &&
        errorToReturn.error.errortext[0] ===
          'The IP Address is invalid. Please add this IP Address to your Whitelist using CTS Portal application https://techservices.transunion.com.'
      ) {
        throw new BadRequestException(
          this.appService.errorHandler(
            400,
            'The IP Address is invalid. Please add this IP Address to your Whitelist using CTS Portal application https://techservices.transunion.com.',
            requestId,
          ),
        );
      }
      throw new InternalServerErrorException({
        ...errorToReturn,
        statusCode: 500,
        requestId,
      });
    }

    fs.appendFileSync(logFilePath, `Response:\n${response.data}\n`);
    const transUnionError = transUnionResponse?.creditBureau?.product?.error;
    if (transUnionError) {
      transUnionHistory = this.transUnionHistoryModel.create({
        user: user.id,
        requestData,
        status: 2,
        responseData: transUnionResponse.creditBureau.product.error,
      });
      transUnionHistory = await this.transUnionHistoryModel.save(
        transUnionHistory,
      );

      // handle TransUnion server errors

      if (
        transUnionError.code === '001' ||
        transUnionError.code === '006' ||
        transUnionError.code === '015' ||
        transUnionError.code === '033' ||
        transUnionError.code === '090'
      ) {
        const errorMessage = transUnionError.description;
        throw new InternalServerErrorException(
          this.appService.errorHandler(500, errorMessage, requestId),
        );
      }

      return {
        screenTracking,
        success: false,
        transUnionHistory,
      };
    }

    let ssnNumber: any;
    if (
      transUnionResponse.creditReport &&
      transUnionResponse.creditReport.creditBureau &&
      transUnionResponse.creditReport.creditBureau.product.subject &&
      transUnionResponse.creditReport.creditBureau.product.subject
        .subjectRecord &&
      transUnionResponse.creditReport.creditBureau.product.subject.subjectRecord
        .indicative &&
      transUnionResponse.creditReport.creditBureau.product.subject.subjectRecord
        .indicative.socialSecurity?.number
    ) {
      ssnNumber =
        transUnionResponse.creditReport.creditBureau.product.subject
          .subjectRecord.indicative.socialSecurity.number;
    } else {
      ssnNumber = user.ssnNumber;
    }

    if (user.ssnNumber !== ssnNumber) {
      user.ssnNumber = ssnNumber;
      await this.userModel.save(user);
    }

    const transUnionsObj = this.buildTransUnions(
      transUnionResponse.creditBureau,
      user,
      requestId,
    );
    let transUnions = this.transUnionsModel.create(transUnionsObj);
    transUnions = await this.transUnionsModel.save(transUnions);

    const creditScore = transUnionsObj.score
      ? parseInt(transUnionsObj.score.slice(1))
      : 0;
    const monthlyDebt = this.getMonthlyTradeDebt(
      transUnionsObj.trade,
      requestId,
    );
    let trade = [];
    if (transUnionsObj.trade && transUnionsObj.trade.length)
      trade = transUnionsObj.trade;
    if (!trade.length) {
      const today = moment().format('YYYY-MM-DD');
      trade.push({
        subscriber: {
          industryCode: 'R',
          memberCode: '',
          name: {
            unparsed: 'REQUESTED AMOUNT',
          },
        },
        portfolioType: 'requesting',
        accountNumber: '',
        ECOADesignator: '',
        dateOpened: {
          _: today,
          estimatedDay: 'false',
          estimatedMonth: 'false',
          estimatedCentury: 'false',
          estimatedYear: 'false',
        },
        dateEffective: {
          _: today,
          estimatedDay: 'false',
          estimatedMonth: 'false',
          estimatedCentury: 'false',
          estimatedYear: 'false',
        },
        currentBalance: 0,
        highCredit: 0,
        creditLimit: 0,
        accountRating: '01',
        account: {
          type: 'RQ',
        },
        pastDue: '000000000',
        updateMethod: 'requested',
      });
    }

    screenTracking.creditScore = creditScore;
    screenTracking.isMil = transUnionsObj.isMil;
    screenTracking.isNoHit = transUnionsObj.isNoHit;
    screenTracking.isOfac = transUnionsObj.isOfac;
    screenTracking.transUnion = transUnions.id;
    screenTracking = await this.screenTrackingModel.save(screenTracking);

    return {
      creditScore,
      monthlyDebt,
      screenTracking,
      success: true,
      transUnionHistory,
      transUnions: transUnions,
    };
  }
}
