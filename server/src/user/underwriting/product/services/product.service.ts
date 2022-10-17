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
import { PracticeManagement } from '../../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { MiddeskReport } from '../../middesk/middesk.entity';

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
  getMonthlyIncome(yearlyIncome) {
    return Math.round(yearlyIncome / 12);
  }

  getTermsBasedOnLoanAmout(amount) {
    let term = 0;
    let nbrAmount: number = parseInt(amount);
    if (nbrAmount < 5001) {
      term = 72;
    }
    if (nbrAmount < 100000) {
      term = 120;
    }
    return term
  }
  async getStage2Rules(
    creditReport: any,
    practiceId: string,
    requestId: string,
    income: number = 0,
    requestedAmount: number = 0
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
    const monthlyRealEstPayment = Number(((((creditReport.summaries || [])[0] || {}).attributes || []).find(x => x.id === 'realEstatePayment') || {}).value);
    const revolvingSum = creditReport.tradeline.filter(x => x.revolvingOrInstallment === 'R' && x.openOrClosed === 'O').reduce((acc, cur) => (parseInt(cur.monthlyPaymentAmount) || 0) + acc, 0) || 0;
    const monthlyDebtPaymentAmt = (monthlyRealEstPayment ? monthlyRealEstPayment : 0) + revolvingSum
    const monthlyIncome = this.getMonthlyIncome(income);
    const disposableIncome = monthlyIncome - monthlyDebtPaymentAmt
    const DTI = monthlyDebtPaymentAmt / monthlyIncome;
    const DTIPercent = Math.round(DTI * 100);
    const monthlyLoanPmtAmt = requestedAmount / this.getTermsBasedOnLoanAmout(requestedAmount);
    const PTI = monthlyLoanPmtAmt / monthlyIncome;
    const PTIPercent = Math.round(PTI * 100);
    const score = parseInt(creditReport.score);
    // Pricing Matrix start
    let manualReview = false;
    let maxApproved = 0;
    // Rule 1
    if ( requestedAmount > 60000) { // At this point we already validated the minumum amount
      manualReview = true;
    }

    let tier = 0;
    if (score >= 760) {
      tier = 1; // A+
      maxApproved = 60000;
    }
    if (score >= 730 && score <= 759) {
      tier = 2; // A
      maxApproved = 45000;
    }
    if (score >= 700 && score <= 729) {
      tier = 3; // B
      maxApproved = 30000;
    }
    if (score >= 660 && score <= 699) {
      tier = 4; // C
      maxApproved = 20000;
    }
    if (score >= 620 && score <= 659){
      tier = 5; // D
    }
    if (score <= 619) {
      tier = 6; // E
    }
    if (requestedAmount > maxApproved) { // this  check if the current Loan Amount is lower that the allowed max
      manualReview = true;
    }
    if (DTIPercent > 60) { // Validating DTI < 60 for all tiers, except tier C needs < 55
      manualReview = true;
    }
    switch(tier) {
      case 1: // Tier A+
        if (disposableIncome <= 999){
          manualReview = true;
        }
        if (disposableIncome <= 2500) {
          if (PTIPercent > 5) {
            manualReview = true;
          }
        }
        if (disposableIncome > 2500) {
          if (PTIPercent > 15) {
            manualReview = true;
          }
        }
        // tier 1 rules
        break;
      case 2: // Tier A
        if (disposableIncome <= 999){
          manualReview = true;
        }
        if (disposableIncome <= 2500) {
          if (PTIPercent > 3) {
            manualReview = true;
          }
        }
        if (disposableIncome <= 5000) {
          if (PTIPercent > 5) {
            manualReview = true;
          }
        }
        if (disposableIncome > 5000) {
          if (PTIPercent > 15) {
            manualReview = true;
          }
        }
        break;
      case 3: // Tier B
        if (disposableIncome <= 999){
          manualReview = true;
        }
        if (disposableIncome <= 2500) {
          if (PTIPercent > 3) {
            manualReview = true;
          }
        }
        if (disposableIncome <= 5000) {
          if (PTIPercent > 5) {
            manualReview = true;
          }
        }
        if (disposableIncome > 5000) {
          if (PTIPercent > 15) {
            manualReview = true;
          }
        }
        break;
      case 4: // Tier C
        if (disposableIncome < 2500) {
          manualReview = true;
        }
        if (disposableIncome <= 5000) {
          if (PTIPercent > 3) {
            manualReview = true;
          }
          if (DTIPercent > 55) {
            manualReview = true;
          }
        }
        if (disposableIncome <= 10000) {
          if (PTIPercent > 5) {
            manualReview = true;
          }
        }
        if (disposableIncome > 10000) {
          if (PTIPercent > 10) {
            manualReview = true;
          }
        }
        break;
      case 5: // Tier D
        manualReview = true;
        break;
      case 6: // Tier E
        manualReview = true;
        break;
      default:
        break;
    }

    // Pricing Matrix ends
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
      monthlyDebtPaymentAmt: monthlyDebtPaymentAmt,
      TotalGMI: monthlyIncome,
      disposableIncome: disposableIncome,
      DTI: DTI,
      monthlyLoanPmtAmt: monthlyLoanPmtAmt,
      PTI: PTI,
      manualReview: manualReview,
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

  async getContractorStage1Rules(
    user: User,
    screenTracking: ScreenTracking,
    creditReport: any,
    requestId: string,
  ) {
    this.logger.log(
      'Getting contractor stage 1 rules with params:',
      `${ProductService.name}#getStage1Rules`,
      requestId,
      { creditReport },
    );

    const rules = {
      rule0: {
        ruleId: 's1_bu_0',
        description: 'Credit Score',
        declinedIf: 'lt',
        value: 620,
        disabled: false,
        weight: 5,
      },
    };

    const ruleUserValueFuncs = {
      rule0: (creditReport: any) => {
        return creditReport.score;
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
      'Contractor Stage 1 result:',
      `${ProductService.name}#getStage1Rules`,
      requestId,
      result,
    );

    return result;
  }

  async getContractorStage2Rules(
    screenTracking: ScreenTracking,
    practiceManagement: PracticeManagement,
    midDesk: any,
    requestId: string,
  ) {
    this.logger.log(
      'Getting contractor stage 2 rules with params:',
      `${ProductService.name}#getStage1Rules`,
      requestId,
      { midDesk },
    );

    const rules = {
      rule0: {
        ruleId: 's2_app_0',
        description: 'Time in Business',
        declinedIf: 'lt',
        value: 3,
        disabled: false,
        weight: 5,
      },
      rule1: {
        ruleId: 's2_md_1',
        description: 'EIN',
        declinedIf: 'ne',
        value: 'success',
        disabled: false,
      },
      rule2: {
        ruleId: 's2_md_2',
        description: 'Business Address',
        declinedIf: 'ne',
        value: 'success',
        disabled: false,
      },
      rule3: {
        ruleId: 's2_md_3',
        description: 'Business Name',
        declinedIf: 'ne',
        value: 'success',
        disabled: false,
      },
    };
    const middeskReport = JSON.parse(midDesk.report).middesk;

    const ruleUserValueFuncs = {
      rule0: () => {
        return Number(practiceManagement.yearsInBusiness);
      },
      rule1: () => {
        const result = middeskReport.review.tasks.filter((obj) => {
          return obj.key === 'tin';
        });
        return result[0]?.status;
      },
      rule2: () => {
        const result = middeskReport.review.tasks.filter((obj) => {
          return obj.key === 'address_verification';
        });
        return result[0]?.status;
      },
      rule3: () => {
        const result = middeskReport.review.tasks.filter((obj) => {
          return obj.key === 'name';
        });
        return result[0]?.status;
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
        const userValue = ruleUserValueFuncs[ruleKey](midDesk);
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
      'Contractor Stage 2 result:',
      `${ProductService.name}#getStage2Rules`,
      requestId,
      result,
    );

    return result;
  }

  async getBorrowerStage1Rules(
    user: User,
    screenTracking: ScreenTracking,
    creditReport: any,
    requestId: string,
  ) {
    this.logger.log(
      'Getting borrower stage 1 rules with params:',
      `${ProductService.name}#getStage1Rules`,
      requestId,
      { creditReport },
    );

    const rules = {
      rule0: {
        ruleId: 's1_bu_0',
        description: 'Credit Score',
        declinedIf: 'lt',
        value: 600,
        disabled: false,
        weight: 5,
      },
      rule1: {
        ruleId: 's1_bu_1',
        description: 'HomeOwner',
        declinedIf: 'eq',
        value: false,
        disabled: false,
        weight: 3,
      },
      rule2: {
        ruleId: 's1_bu_2',
        description: 'Monthly Income > 2000',
        declinedIf: 'lt',
        value: 1500,
        disabled: false,
        weight: 5,
      },
      rule3: {
        ruleId: 's1_bu_3',
        description: 'Age',
        declinedIf: 'lt',
        value: 18,
        disabled: false,
        weight: 5,
      },
    };
    let isPending = false;
    const ruleUserValueFuncs = {
      rule0: (creditReport: any) => {
        return creditReport.score;
      },
      rule1: () => {
        return user.propertyOwnership;
      },
      rule2: () => {
        const income = Math.round(user.income / 12);
        if (income > 1500 && income < 2000) {
          if (result) {
            result.isPending =  true;
          }
        }
        return income;
      },
      rule3: () => { // All applicants should be > 18 years
        const birthday = user.dateOfBirth;
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const m = today.getMonth() - birthday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
          age--;
        }
        return age;
      }
    };

    const result = {
      approvedRuleMsg: [],
      declinedRuleMsg: [],
      ruleApprovals: {},
      ruleData: {},
      loanApproved : true,
      isPending: isPending,
      income: user.income,
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
      'Contractor Stage 1 result:',
      `${ProductService.name}#getStage1Rules`,
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
