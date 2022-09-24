import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoggerService } from '../../../../logger/services/logger.service';
import { ScreenTracking } from '../../../screen-tracking/entities/screen-tracking.entity';
import { User } from '../../../entities/user.entity';
import { ProductRules } from '../entities/product-rules.entity';
import { AppService } from '../../../../app.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductRules)
    private readonly productRulesModel: Repository<ProductRules>,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async createPartnerRules(
    practiceId: string,
    productId: string,
    requestId: string,
  ): Promise<ProductRules> {
    const partnerRules =
      this.configService.get<Record<string, unknown>>('newPartnerRuleSet');
    partnerRules.practiceManagement = practiceId;
    partnerRules.product = productId
      ? productId
      : this.configService.get<string>('productId');

    this.logger.log(
      'Creating partner rules with params:',
      `${ProductService.name}#createPartnerRules`,
      requestId,
      partnerRules,
    );
    let productRules: ProductRules =
      this.productRulesModel.create(partnerRules);
    productRules = await this.productRulesModel.save(partnerRules);
    this.logger.log(
      'Partner rules created',
      `${ProductService.name}#createPartnerRules`,
      requestId,
      productRules,
    );

    return productRules;
  }

  async updatePartnerRules(
    currentRules: ProductRules,
    requestId: string,
  ): Promise<ProductRules> {
    this.logger.log(
      'Updating partner rules with params:',
      `${ProductService.name}#updatePartnerRules`,
      requestId,
      currentRules,
    );
    const availableRules =
      this.configService.get<Record<string, any>>('newPartnerRuleSet').rules;

    let addCount = 0;
    for (const [key, value] of Object.entries(availableRules)) {
      if (!currentRules.rules[key]) {
        currentRules.rules[key] = value;
        currentRules.rules[key].disabled = true;
        addCount++;
      }
    }
    if (addCount > 0) {
      await this.productRulesModel.save(currentRules);
      this.logger.log(
        `Partner ${addCount} rules updated`,
        `${ProductService.name}#updatePartnerRules`,
        requestId,
      );
    } else {
      this.logger.log(
        'Nothing to update',
        `${ProductService.name}#updatePartnerRules`,
        requestId,
      );
    }

    return currentRules;
  }

  async getStage1Rules(
    user: User,
    screenTracking: ScreenTracking,
    requestId: string,
  ) {
    this.logger.log(
      'Getting stage 1 rules with params:',
      `${ProductService.name}#getStage1Rules`,
      requestId,
      { user, screenTracking },
    );
    const rules = {
      rule1: {
        ruleId: 's1_app_1',
        description: 'Age',
        declinedIf: 'lt',
        value: 18,
        disabled: false,
      },
      rule2: {
        ruleId: 's1_app_2',
        description: 'Monthly Income',
        declinedIf: 'lt',
        value: 1000,
        disabled: false,
      },
    };
    const ruleUserValueFuncs = {
      rule1: () => {
        const today = moment().startOf('day');
        let dob = user.dateOfBirth;
        if (!dob) {
          dob = moment().startOf('day').toDate();
        } else {
          dob = moment(dob, 'YYYY-MM-DD').toDate();
        }

        return today.diff(dob, 'years');
      },
      rule2: () => {
        return screenTracking.incomeAmount;
      },
    };
    const result = {
      approvedRuleMsg: [],
      declinedRuleMsg: [],
      loanApproved: true,
      ruleApprovals: {},
      ruleData: {},
    };
    Object.keys(rules).forEach((ruleKey) => {
      const rule = rules[ruleKey];
      if (
        !rule.disabled &&
        ruleUserValueFuncs[ruleKey] &&
        typeof ruleUserValueFuncs[ruleKey] === 'function'
      ) {
        result.ruleData[rule.ruleId] = {
          description: rule.description,
          message: 'Not applied',
          passed: true,
          ruleId: rule.ruleId,
          userValue: null,
        };
        const userValue = ruleUserValueFuncs[ruleKey]();
        const { passed, message } = this.getRulePassedMessage(
          rule,
          userValue,
          requestId,
        );
        result.ruleData[rule.ruleId].message = message;
        result.ruleData[rule.ruleId].passed = passed;
        result.ruleData[rule.ruleId].userValue = userValue;
        if (!passed) {
          result.loanApproved = false;
        }
        if (result.ruleData[rule.ruleId].passed) {
          result.approvedRuleMsg.push(result.ruleData[rule.ruleId].message);
        } else {
          result.declinedRuleMsg.push(result.ruleData[rule.ruleId].message);
        }
        result.ruleApprovals[rule.ruleId] = result.ruleData[rule.ruleId].passed
          ? 1
          : 0;
      }
    });
    this.logger.log(
      'Stage 1 rules result:',
      `${ProductService.name}#getStage1Rules`,
      requestId,
      result,
    );

    return result;
  }

  async getStage2Rules(
    creditReport: any,
    practiceId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting stage 2 rules with params:',
      `${ProductService.name}#getStage2Rules`,
      requestId,
      { creditReport, practiceId },
    );
    const productRules = await this.getProductRulesValue(
      this.configService.get<string>('productId'),
      practiceId,
      requestId,
    );
    const rules = productRules.rules;
    if (!rules || !Object.keys(rules).length)
      throw new InternalServerErrorException(
        this.appService.errorHandler(
          500,
          `product rules not found for productId: ${this.configService.get<string>(
            'productId',
          )} and practiceId: ${practiceId}`,
          requestId,
        ),
      );

    const ruleUserValueFuncs = {
      // No hit
      rule0: (creditReport: any) => {
        const fileHitIndicator =
          creditReport?.product?.subject?.subjectRecord?.fileSummary
            ?.fileHitIndicator || 'regularNoHit';

        return fileHitIndicator === 'regularNoHit';
      },
      // Months of credit history
      rule1: (creditReport: any) => {
        let userValue = 0;
        const inFileSinceDate =
          creditReport?.product?.subject?.subjectRecord?.fileSummary
            ?.inFileSinceDate?._;
        if (inFileSinceDate) {
          userValue = moment()
            .startOf('day')
            .diff(
              moment(inFileSinceDate, 'YYYY-MM-DD').startOf('day'),
              'months',
            );
        }
        return userValue;
      },
      // Active trade lines
      rule2: (creditReport: any) => {
        let trades =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit?.trade;
        if (trades && !Array.isArray(trades)) {
          trades = [trades];
        }

        if (trades && trades.length) {
          const ecoaIgnore = ['authorizeduser', 'terminated', 'deceased'];
          const industryIgnore = ['E', 'M'];
          const goodRatings = ['01'];
          trades = trades.filter((trade: any) => {
            let keepIt = true;
            const accountRating = trade.accountRating;
            const isClosed: boolean = trade.dateClosed != null;
            const isPaidOut: boolean = trade.datePaidOut != null;
            const industryCode = trade.subscriber.industryCode
              ? trade.subscriber.industryCode
              : '-';
            if (
              industryIgnore.indexOf(
                `${industryCode}`.toUpperCase().substr(0, 1),
              ) >= 0 ||
              ecoaIgnore.indexOf(trade.ECOADesignator.toLowerCase()) >= 0 ||
              goodRatings.indexOf(accountRating) === -1 ||
              isPaidOut ||
              isClosed
            )
              keepIt = false;
            return keepIt;
          });

          return trades.length;
        }
        return 0;
      },
      // Revolving trade lines
      rule3: (creditReport: any) => {
        let trades =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit?.trade;
        if (trades && !Array.isArray(trades)) trades = [trades];

        if (trades && trades.length) {
          const ecoaIgnore = ['authorizeduser', 'terminated', 'deceased'];
          const industryIgnore = ['E', 'M'];
          const goodRatings = ['01'];
          trades = trades.filter((trade: any) => {
            let keepIt = true;
            const accountRating = trade.accountRating;
            const isClosed: boolean =
              (trade.dateClosed ? trade.dateClosed : null) !== null;
            const isPaidOut: boolean =
              (trade.datePaidOut ? trade.datePaidOut : null) !== null;
            const portfolioType = trade.portfolioType;
            const ecoaDesignator = trade.ECOADesignator;
            const industryCode = trade.subscriber.industryCode
              ? trade.subscriber.industryCode
              : '-';
            if (
              industryIgnore.indexOf(industryCode) !== -1 ||
              ecoaIgnore.indexOf(ecoaDesignator.toLowerCase()) !== -1 ||
              goodRatings.indexOf(accountRating) === -1 ||
              isPaidOut ||
              isClosed ||
              portfolioType.toLowerCase() !== 'revolving'
            )
              keepIt = false;
            return keepIt;
          });

          return trades.length;
        }
        return 0;
      },
      // Inquiries in the last 6 months
      rule4: (creditReport: any) => {
        const inquiryStartDate = moment().startOf('day').subtract(6, 'months');
        let inquiries =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.inquiry || [];
        if (!Array.isArray(inquiries)) {
          inquiries = [inquiries];
        }
        let count = 0;
        inquiries.forEach((inquiry: any) => {
          let inquiryDate = inquiry.date?._;
          if (inquiryDate) {
            inquiryDate = moment(inquiryDate, 'YYYY-MM-DD').startOf('day');
            if (inquiryDate.isSameOrAfter(inquiryStartDate)) count++;
          }
        });
        return count;
      },
      // Bankruptcies in the last 24 months
      rule5: (creditReport: any) => {
        const bankruptcyStartDate = moment()
          .startOf('day')
          .subtract(24, 'months');
        const bankruptcyTypes =
          this.configService.get<string[]>('bankruptcyTypes');
        let publicRecords =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.publicRecord || [];
        if (!Array.isArray(publicRecords)) {
          publicRecords = [publicRecords];
        }
        let count = 0;
        publicRecords.forEach((publicRecord) => {
          if (
            publicRecord.type &&
            bankruptcyTypes.indexOf(publicRecord.type) > -1
          ) {
            let bankruptcyDate = publicRecord.dateFiled?._;
            if (bankruptcyDate) {
              bankruptcyDate = moment(bankruptcyDate, 'YYYY-MM-DD').startOf(
                'day',
              );
              if (bankruptcyDate.isSameOrAfter(bankruptcyStartDate)) count++;
            }
          }
        });
        return count;
      },
      // Foreclosures in the last 24 months
      rule6: (creditReport: any) => {
        const foreclosureStartDate = moment()
          .startOf('day')
          .subtract(24, 'months');
        const foreclosureTypes =
          this.configService.get<string[]>('foreclosureTypes');
        let publicRecords =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.publicRecord || [];
        if (!Array.isArray(publicRecords)) {
          publicRecords = [publicRecords];
        }
        let count = 0;
        publicRecords.forEach((publicRecord: any) => {
          if (
            publicRecord.type &&
            foreclosureTypes.indexOf(publicRecord.type) > -1
          ) {
            let bankruptcyDate = publicRecord.dateFiled?._;
            if (bankruptcyDate) {
              bankruptcyDate = moment(bankruptcyDate, 'YYYY-MM-DD').startOf(
                'day',
              );
              if (bankruptcyDate.isSameOrAfter(foreclosureStartDate)) count++;
            }
          }
        });
        return count;
      },
      // Public records in the last 24 months
      rule7: (creditReport: any) => {
        const publicRecordStartDate = moment()
          .startOf('day')
          .subtract(24, 'months');
        let publicRecords =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.publicRecord || [];
        if (!Array.isArray(publicRecords)) {
          publicRecords = [publicRecords];
        }
        let collectionRecords =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.collection || [];
        if (!Array.isArray(collectionRecords)) {
          collectionRecords = [collectionRecords];
        }
        let count = 0;
        publicRecords.forEach((publicRecord: any) => {
          let publicRecordDate = publicRecord.dateFiled?._;
          if (publicRecordDate) {
            publicRecordDate = moment(publicRecordDate, 'YYYY-MM-DD').startOf(
              'day',
            );
            if (publicRecordDate.isSameOrAfter(publicRecordStartDate)) {
              count++;
            }
          }
        });
        collectionRecords.forEach((collectionRecord: any) => {
          let collectionRecordDate = collectionRecord.dateFiled?._;
          if (collectionRecordDate) {
            collectionRecordDate = moment(
              collectionRecordDate,
              'YYYY-MM-DD',
            ).startOf('day');
            if (collectionRecordDate.isSameOrAfter(publicRecordStartDate))
              count++;
          }
        });
        return count;
      },
      // Trades with 60+ DPD in the Last 24 Months
      rule8: (creditReport: any) => {
        const now = moment();
        let trades =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.trade || [];
        if (trades && !Array.isArray(trades)) {
          trades = [trades];
        }
        let count = 0;
        trades.forEach((trade: any) => {
          let tradeDate = trade.paymentHistory?.paymentPattern?.startDate?._;
          const tradeText = trade.paymentHistory?.paymentPattern?.text;
          if (tradeDate && tradeText) {
            tradeDate = moment(tradeDate, 'YYYY-MM-DD').startOf('day');
            const monthDiff = Math.abs(tradeDate.diff(now));
            if (
              monthDiff < 24 &&
              monthDiff >= 0 &&
              (tradeText.indexOf('3') > -1 ||
                tradeText.indexOf('K') > -1 ||
                tradeText.indexOf('G') > -1 ||
                tradeText.indexOf('L') > -1)
            )
              count++;
          }
        });
        return count;
      },
      // Trades with 60+ DPD in the Last 6 Months
      rule9: (creditReport: any) => {
        const now = moment();
        let trades =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.trade || [];
        if (trades && !Array.isArray(trades)) {
          trades = [trades];
        }
        let count = 0;
        trades.forEach((trade: any) => {
          let tradeDate = trade.paymentHistory?.paymentPattern?.startDate?._;
          const tradeText = trade.paymentHistory?.paymentPattern?.text;
          if (tradeDate && tradeText) {
            tradeDate = moment(tradeDate, 'YYYY-MM-DD').startOf('day');
            const monthDiff = Math.abs(tradeDate.diff(now));
            if (
              monthDiff < 6 &&
              monthDiff >= 0 &&
              (tradeText.indexOf('3') > -1 ||
                tradeText.indexOf('K') > -1 ||
                tradeText.indexOf('G') > -1 ||
                tradeText.indexOf('L') > -1)
            )
              count++;
          }
        });
        return count;
      },
      // Utilization of Revolving Trades
      rule10: (creditReport: any) => {
        const utilizationStartDate = moment()
          .startOf('day')
          .subtract(6, 'months');
        let trades =
          creditReport?.product?.subject?.subjectRecord?.custom?.credit
            ?.trade || [];
        if (trades && !Array.isArray(trades)) {
          trades = [trades];
        }

        let totalRevolvingCreditLimit = 0;
        let totalRevolvingBalance = 0;
        trades.forEach((trade: any) => {
          const portfolioType = trade.portfolioType;
          const currentBalance = parseFloat(trade.currentBalance);
          const ecoaDesignator = trade.ECOADesignator;
          const creditLimit = parseFloat(trade.creditLimit);
          let dateEffective = trade.dateEffective?._;
          if (dateEffective) {
            dateEffective = moment(dateEffective, 'YYYY-MM-DD').startOf('day');
          }
          if (
            currentBalance === 0 &&
            (trade.hasOwnProperty('datePaidOut') ||
              trade.hasOwnProperty('dateClosed'))
          )
            return;
          if (
            portfolioType.toLowerCase() === 'revolving' &&
            dateEffective &&
            dateEffective.isAfter(utilizationStartDate) &&
            ['jointContractLiability', 'authorizedUser', 'terminated'].indexOf(
              ecoaDesignator,
            ) === -1 &&
            creditLimit > 0
          ) {
            totalRevolvingCreditLimit += creditLimit;
            if (currentBalance > 0) {
              totalRevolvingBalance += currentBalance;
            }
          }
        });

        let userValue = 0;
        if (totalRevolvingCreditLimit) {
          userValue = totalRevolvingBalance / totalRevolvingCreditLimit;
        }

        return userValue;
      },
    };

    const result = {
      approvedRuleMsg: [],
      declinedRuleMsg: [],
      ruleApprovals: {},
      ruleData: {},
      totalAdjWeight: 0,
    };
    Object.keys(rules).forEach((ruleKey) => {
      const rule = rules[ruleKey];
      if (
        !rule.disabled &&
        ruleUserValueFuncs[ruleKey] &&
        typeof ruleUserValueFuncs[ruleKey] === 'function'
      ) {
        result.ruleData[rule.ruleId] = {
          adjWeight: 0,
          description: rule.description,
          message: 'Not applied',
          passed: true,
          ruleId: rule.ruleId,
          userValue: null,
        };
        const userValue = ruleUserValueFuncs[ruleKey](creditReport);
        const { passed, message } = this.getRulePassedMessage(
          rule,
          userValue,
          requestId,
        );

        result.ruleData[rule.ruleId].message = message;
        result.ruleData[rule.ruleId].passed = passed;
        result.ruleData[rule.ruleId].userValue = userValue;
        if (!passed) {
          result.ruleData[rule.ruleId].adjWeight = rule.weight;
          result.totalAdjWeight += rule.weight;
        }
        if (result.ruleData[rule.ruleId].passed) {
          result.approvedRuleMsg.push(result.ruleData[rule.ruleId].message);
        } else {
          result.declinedRuleMsg.push(result.ruleData[rule.ruleId].message);
        }

        result.ruleApprovals[rule.ruleId] = result.ruleData[rule.ruleId].passed
          ? 1
          : 0;
      }
    });

    this.logger.log(
      'Stage 2 result:',
      `${ProductService.name}#getStage2Rules`,
      requestId,
      result,
    );

    return result;
  }

  async getProductRulesValue(
    productId: string,
    practiceId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting product rules with params:',
      `${ProductService.name}#getProductRulesValue`,
      requestId,
      { productId, practiceId },
    );
    const ruleCriteria = {
      // product: productId,
      practiceManagement: practiceId,
      isDeleted: false,
    };

    let ruleDetails: ProductRules = await this.productRulesModel.findOne({
      where: ruleCriteria,
      order: {
        id: 'ASC',
      },
    });

    if (!ruleDetails) {
      await this.createPartnerRules(practiceId, productId, requestId);
      ruleDetails = await this.productRulesModel.findOne({
        where: ruleCriteria,
        order: {
          id: 'ASC',
        },
      });
    } else {
      ruleDetails = await this.updatePartnerRules(ruleDetails, requestId);
    }

    const toDelete = [];
    for (const rule in ruleDetails.rules) {
      if (ruleDetails.rules[rule].disabled) {
        toDelete.push(rule);
      }
    }
    toDelete.forEach((ruleName) => {
      delete ruleDetails.rules[ruleName];
    });

    this.logger.log(
      'Product rules:',
      `${ProductService.name}#getProductRulesValue`,
      requestId,
      ruleDetails,
    );

    return ruleDetails;
  }

  getRulePassedMessage(
    rule: Record<string, any>,
    userValue: any,
    requestId: string,
  ) {
    this.logger.log(
      'Getting user passed message with params:',
      `${ProductService.name}#getRulePassedMessage`,
      requestId,
      { rule, userValue },
    );
    let passed = true;
    let relation = '';
    switch (rule.declinedIf) {
      case 'eq':
        passed = rule.value !== userValue;
        passed ? (relation = '!=') : (relation = '=');
        break;
      case 'ne':
        passed = rule.value === userValue;
        passed ? (relation = '=') : (relation = '!=');
        break;
      case 'gt':
        if (userValue > rule.value) passed = false;
        passed ? (relation = '<=') : (relation = '>');
        break;
      case 'lt':
        if (userValue < rule.value) passed = false;
        passed ? (relation = '>=') : (relation = '<');
        break;
      case 'gte':
        if (userValue >= rule.value) passed = false;
        passed ? (relation = '<') : (relation = '>=');
        break;
      case 'lte':
        if (userValue <= rule.value) passed = false;
        passed ? (relation = '>') : (relation = '<=');
        break;
      default:
        throw new BadRequestException(
          this.appService.errorHandler(
            400,
            `${rule.declinedIf} is not a supported rule operator`,
            requestId,
          ),
        );
    }

    const result = {
      message: `${rule.ruleId}: ${rule.description} ${relation} ${
        rule.value
      } then ${passed ? 'pass' : 'decline'}`,
      passed,
    };
    this.logger.log(
      'User passed message:',
      `${ProductService.name}#getRulePassedMessage`,
      requestId,
      result,
    );
    return result;
  }

  getProductId(): string {
    return this.configService.get<string>('productId');
  }
}
