import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppService } from '../../../app.service';
import { ScreenTracking } from '../../screen-tracking/entities/screen-tracking.entity';
import { OffersDto } from '../validation/offers.dto';
import { TransunionService } from '../../underwriting/transunion/services/transunion.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { MathExtService } from '../../../loans/mathext/services/mathext.service';
import { LoanInterestRate } from '../../../loans/entities/interest-rate.entity';
import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { TransUnion } from '../../underwriting/transunion/entities/transunion.entity';
import { SelectOfferDto } from '../validation/selectOffer.dto';
import { PaymentManagementService } from '../../../loans/payments/payment-management/payment-management.service';

@Injectable()
export class OffersService {
  aprDecPlaces: 4;

  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(PracticeManagement)
    private readonly practiceManagementModel: Repository<PracticeManagement>,
    @InjectRepository(LoanInterestRate)
    private readonly loanInterestRateModel: Repository<LoanInterestRate>,
    private readonly transUnionService: TransunionService,
    private readonly mathExtService: MathExtService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async approvedUpToOffers(offersDto: OffersDto, requestId: string) {
    const { requestedLoanAmount, screenTrackingId } = offersDto;
    this.logger.log(
      'Generating offers with params:',
      `${OffersService.name}#approvedUpToOffers`,
      requestId,
      offersDto,
    );
    const screenTracking: ScreenTracking =
      await this.screenTrackingModel.findOne({
        where: {
          id: screenTrackingId,
        },
        relations: ['user', 'transUnion', 'practiceManagement'],
      });

    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${OffersService.name}#approvedUpToOffers`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking record not found',
          requestId,
        ),
      );
    }

    const user = screenTracking.user;
    if (!user) {
      this.logger.error(
        'User for this screen tracking not found',
        `${OffersService.name}#approvedUpToOffers`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, 'user record not found', requestId),
      );
    }

    const declineReasons: Record<string, any>[] = screenTracking.declineReasons;
    if (declineReasons && declineReasons.length > 0) {
      this.logger.error(
        'User has been declined before',
        `${OffersService.name}#approvedUpToOffers`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, 'No offers available.', requestId),
      );
    }

    const result: any = {
      status: 'declined',
    };
    const offers = await this.getPracticeOffers(
      requestedLoanAmount,
      screenTracking,
      requestId,
    );
    if (offers.declineReasons && offers.declineReasons.length > 0) {
      this.logger.log(
        'User got declined with reasons:',
        `${OffersService.name}#approvedUpToOffers`,
        requestId,
        offers.declineReasons,
      );
      result.declinedReasons = offers.declineReasons;
      screenTracking.declineReasons = offers.declineReasons;
      screenTracking.lastLevel = 'denied';

      await this.screenTrackingModel.save(screenTracking);
      await this.paymentManagementService.createPaymentManagement(
        screenTracking,
        'denied',
        requestId,
      );

      return result;
    }

    if (offers.offers && offers.offers.length) {
      let maxOfferAmount = 0;
      let minOfferAmount = Infinity;
      offers.offers.forEach((offer) => {
        if (offer.maxLoanAmt > maxOfferAmount) {
          maxOfferAmount = offer.maxLoanAmt;
        }

        maxOfferAmount = Math.max(maxOfferAmount, offer.maxLoanAmt);
        minOfferAmount = 1000;
      });
      result.status = 'Approved';
      result.approvedUpTo = maxOfferAmount;
      result.minimumAmount = minOfferAmount;
      result.offers = offers.offers;

      screenTracking.requestedAmount = requestedLoanAmount;
      screenTracking.offers = offers.offers;
      screenTracking.approvedUpTo = result.approvedUpTo;
      screenTracking.preDTIMonthlyAmount = offers.preDTI.monthlyAmount;
      screenTracking.preDTIPercentValue = offers.preDTI.percent;

      await this.screenTrackingModel.save(screenTracking);

      let loanStatus: 'approved' | 'pending' = 'approved';
      if (
        screenTracking.isNoHit ||
        screenTracking.isOfac ||
        screenTracking.isMil ||
        screenTracking.creditScore === 0
      ) {
        loanStatus = 'pending';
      }
      await this.paymentManagementService.createPaymentManagement(
        screenTracking,
        loanStatus,
        requestId,
      );

      this.logger.log(
        'Offers generated:',
        `${OffersService.name}#approvedUpToOffers`,
        requestId,
        result,
      );
      return result;
    }
  }

  aprRateCalculator(
    options: {
      fv?: number;
      guess?: number;
      loanAmount: number;
      downPayment: number;
      payment: number;
      term: number;
      type?: number;
    },
    requestId: string,
  ) {
    const { loanAmount, payment, downPayment, term } = options;
    const financedAmount = loanAmount - downPayment;
    let { fv, guess, type } = options;
    fv = fv | 0;
    guess = guess | 0.1;
    type = type | 0;
    this.logger.log(
      'Calculating APR rate with params:',
      `${OffersService.name}#aprRateCalculator`,
      requestId,
      options,
    );
    let lowLimit = 0;
    let highLimit = 1;
    const tolerance = Math.abs(0.00000005 * payment);

    for (let i = 0; i < 100; i++) {
      let balance = financedAmount;
      for (let j = 0; j < term; j++) {
        if (type === 0) {
          balance = balance * (1 + guess) + payment;
        } else {
          balance = (balance + payment) * (1 + guess);
        }
      }
      if (Math.abs(balance + fv) < tolerance) {
        break;
      } else if (balance + fv > 0) {
        highLimit = guess;
      } else {
        lowLimit = guess;
      }
      guess = (highLimit + lowLimit) / 2;
    }

    this.logger.log(
      'Calculated APR rate:',
      `${OffersService.name}#aprRateCalculator`,
      requestId,
      guess,
    );
    return guess;
  }

  calcMonthlyPayment(
    apr = 0,
    loanAmount = 0,
    downPayment = 0,
    term = 0,
    requestId: string,
  ) {
    this.logger.log(
      'Calculating monthly payment with params:',
      `${OffersService.name}#calcMonthlyPayment`,
      requestId,
      { apr, loanAmount, term },
    );
    const decimalRate = apr / 100 / 12;
    const xPowerVal = decimalRate + 1;
    const financedAmount = loanAmount - downPayment;
    if (!term || isNaN(term)) {
      return {
        decimalRate,
        xPowerVal,
        financeCharge: null, // depend on "term"
        decimalAmount: null,
        fullNumberAmount: null,
        totalLoanAmount: null,
        powerRateVal: null,
        monthlyPayment: null,
      };
    }

    let financeCharge = 0;
    let monthlyPayment = financedAmount / term;
    let totalLoanAmount = financedAmount;
    const powerRateVal = Math.pow(xPowerVal, term) - 1;
    if (apr) {
      monthlyPayment = parseFloat(
        ((decimalRate + decimalRate / powerRateVal) * financedAmount).toFixed(
          2,
        ),
      );
      const amortizationSchedule = this.mathExtService.makeAmortizationSchedule(
        financedAmount,
        monthlyPayment,
        // downPayment,
        apr,
        term,
        requestId,
      );
      if (amortizationSchedule.interestPaid)
        financeCharge = this.mathExtService.float(
          amortizationSchedule.interestPaid,
        );
      totalLoanAmount = this.mathExtService.float(
        financedAmount + financeCharge + downPayment,
      );
    }

    monthlyPayment = parseFloat(parseFloat(String(monthlyPayment)).toFixed(2));
    totalLoanAmount = parseFloat(
      parseFloat(String(totalLoanAmount)).toFixed(2),
    );
    financeCharge = parseFloat(parseFloat(String(financeCharge)).toFixed(2));
    const monthlyPaymentArray = monthlyPayment.toFixed(2).split('.');
    let fullNumberAmount = '0';
    let decimalAmount = '.00';
    if (monthlyPaymentArray[0]) {
      fullNumberAmount = monthlyPaymentArray[0];
    }
    if (monthlyPaymentArray[1]) {
      decimalAmount = `.${monthlyPaymentArray[1]}`;
    }

    const result = {
      decimalRate,
      xPowerVal,
      financeCharge,
      decimalAmount,
      fullNumberAmount,
      totalLoanAmount,
      powerRateVal,
      monthlyPayment,
    };
    this.logger.log(
      'Calculated monthly payment:',
      `${OffersService.name}#calcMonthlyPayment`,
      requestId,
      result,
    );

    return result;
  }

  getDeclineMsgs(
    options: {
      stateCode: string;
      neededDTI: number;
      loanAmount?: number;
      maxCreditScore?: number;
      maxLoanAmount?: number;
      minCreditScore?: number;
      minLoanAmount?: number;
      postDTI?: number;
      dti?: number;
      creditScore?: number;
    },
    requestId: string,
  ) {
    const {
      stateCode,
      neededDTI,
      loanAmount,
      maxCreditScore,
      maxLoanAmount,
      minCreditScore,
      minLoanAmount,
      postDTI,
      dti,
      creditScore,
    } = options;
    this.logger.log(
      'Getting decline messages with params:',
      `${OffersService.name}#getDeclineMsgs`,
      requestId,
      options,
    );
    const declineMsgs = [];
    if (creditScore && minCreditScore && creditScore < minCreditScore) {
      declineMsgs.push({
        msg: `[creditBelowState] The patient's credit score of ${creditScore} is less than the required ${minCreditScore} for the state of ${stateCode}.`,
        reason:
          "Your application could not be approved because your credit score does not meet the provider's minimum requirement.",
      });
    }
    if (creditScore && maxCreditScore && creditScore > maxCreditScore) {
      declineMsgs.push({
        msg: `[creditHighState] The patient's credit score of ${creditScore} is higher than the required ${maxCreditScore} for the state of ${stateCode}.`,
        reason:
          "Your application could not be approved because your credit score does not meet the provider's maximum requirement.",
      });
    }
    if (dti && neededDTI && dti > neededDTI) {
      declineMsgs.push({
        msg: `[dtiHigh] The patient's DTI of ${dti} is greater than the ${neededDTI} required for a credit score of ${creditScore} in the state of ${stateCode}.`,
        reason:
          "Your application could not be approved because your debt to income ratio does not meet the provider's minimum requirement.",
      });
    }
    if (postDTI && neededDTI && postDTI > neededDTI) {
      declineMsgs.push({
        msg: `[postDtiHigh] The patient's post DTI of ${postDTI} is greater than the ${neededDTI} required for a credit score of ${creditScore} in the state of ${stateCode}.`,
        reason:
          "Your application could not be approved because your debt to income ratio does not meet the provider's minimum requirement.",
      });
    }
    if (loanAmount && maxLoanAmount && loanAmount > maxLoanAmount) {
      declineMsgs.push({
        msg: `[loanHigh] The patient's loan amount of ${loanAmount} is greater than the max loan amount allowed of ${maxLoanAmount}.`,
        reason:
          "Your application could not be approved because your loan amount exceeds the provider's maximum loan amount.",
      });
    }
    if (loanAmount && minLoanAmount && loanAmount < minLoanAmount) {
      declineMsgs.push({
        msg: `[loanLow] The patient's loan amount of ${loanAmount} is less than the minimum loan amount allowed of ${minLoanAmount}.`,
        reason:
          "Your application could not be approved because your loan amount is less than the provider's minimum loan amount.",
      });
    }
    if (!declineMsgs.length) {
      declineMsgs.push({
        msg: '[unknown] Reason unknown.',
        reason:
          'Your application could not be approved at this time, please contact your provider.',
      });
    }

    this.logger.log(
      'Gotten decline messages:',
      `${OffersService.name}#calcMonthlyPayment`,
      requestId,
      declineMsgs,
    );
    return declineMsgs;
  }

  async getPracticeOffers(
    loanAmount: number,
    screenTrackingDocument: ScreenTracking,
    requestId: string,
  ) {
    this.logger.log(
      'Getting practice offers with params:',
      `${OffersService.name}#getPracticeOffers`,
      requestId,
      { loanAmount, screenTrackingDocument },
    );
    const result = {
      declineReasons: [],
      offers: [],
      loanStatus: 'Declined',
      preDTI: { monthlyAmount: 0, percent: 0 },
    };
    const trades = (screenTrackingDocument.transUnion as TransUnion).trade;
    if (!trades) {
      this.logger.error(
        'TransUnion object not found in screen tracking',
        `${OffersService.name}#getPracticeOffers`,
        requestId,
        { loanAmount, screenTrackingDocument },
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'TransUnion report not found for this user',
          requestId,
        ),
      );
    }
    const creditScore: number = screenTrackingDocument.creditScore;
    const annualIncome: number = +screenTrackingDocument.incomeAmount;
    const monthlyIncome: number = parseFloat((annualIncome / 12).toFixed(2));
    const monthlyDebt: number = this.transUnionService.getMonthlyTradeDebt(
      trades,
      requestId,
    );
    const adjRulesWeight: number = screenTrackingDocument.adjRulesWeight || 0;
    const practiceId: string = (
      screenTrackingDocument.practiceManagement as PracticeManagement
    ).id;
    const practiceManagement: PracticeManagement =
      await this.practiceManagementModel.findOne({
        where: {
          id: practiceId,
        },
      });
    if (!practiceManagement) {
      this.logger.error(
        'Practice management not found',
        `${OffersService.name}#getPracticeOffers`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `PracticeManagement not found by id: ${practiceId}`,
          requestId,
        ),
      );
    }

    const stateCode = practiceManagement.stateCode;
    result.preDTI.monthlyAmount = monthlyDebt;
    result.preDTI.percent = parseFloat(
      ((monthlyDebt / monthlyIncome) * 100).toFixed(2),
    );
    // Retrieves loan tier and interest rate
    let offers: LoanInterestRate[] = await this.loanInterestRateModel.find({
      where: { stateCode },
      order: {
        term: 'ASC',
      },
    });

    if (!offers) {
      this.logger.error(
        'Loan interest rate not found',
        `${OffersService.name}#getPracticeOffers`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `LoanInterestRate not found by stateCode ${stateCode}`,
          requestId,
        ),
      );
    }
    let minLoanAmount = Infinity;
    let maxLoanAmount = 0;
    let minCreditScore = Infinity;
    const neededDTI = 0;
    offers = offers.filter((offer) => {
      minLoanAmount = Math.min(minLoanAmount, offer.minLoanAmount);
      maxLoanAmount = Math.max(maxLoanAmount, offer.maxLoanAmount);
      minCreditScore = Math.min(minCreditScore, offer.ficoMin);
      return (
        creditScore >= offer.ficoMin &&
        creditScore <= offer.ficoMax &&
        (screenTrackingDocument.lockCreditTier
          ? screenTrackingDocument.lockCreditTier === offer.grade
          : true)
      );
    });
    if (!offers.length) {
      const declineMessages = this.getDeclineMsgs(
        {
          creditScore,
          dti: result.preDTI.percent,
          loanAmount,
          minLoanAmount,
          maxLoanAmount,
          minCreditScore,
          neededDTI,
          stateCode,
        },
        requestId,
      );
      result.declineReasons.push(declineMessages);
      this.logger.log(
        'Offers declined with result:',
        `${OffersService.name}#getPracticeOffers`,
        requestId,
        result,
      );

      return result;
    }

    let postDTI: number = result.preDTI.percent;
    result.offers = offers
      .filter(
        (offer) =>
          adjRulesWeight === offer.adjWeightMax ||
          (adjRulesWeight > 5 && offer.adjWeightMax === 5),
      )
      .map((offer) => {
        offer.loanAmount = loanAmount || offer.maxLoanAmount;
        if (offer.loanAmount > offer.maxLoanAmount) {
          offer.loanAmount = offer.maxLoanAmount;
        }
        if (offer.loanAmount < offer.minLoanAmount) {
          offer.loanAmount = offer.minLoanAmount;
        }

        const termMoPymtResp = this.calcMonthlyPayment(
          offer.interestRate,
          offer.loanAmount,
          offer.downPayment,
          offer.term,
          requestId,
        );
        const termEffectiveRateValue = this.aprRateCalculator(
          {
            loanAmount: offer.loanAmount,
            payment: termMoPymtResp.monthlyPayment * -1,
            downPayment: offer.downPayment,
            term: offer.term,
          },
          requestId,
        );
        let termEffectiveRate = 12 * termEffectiveRateValue * 100;
        termEffectiveRate = parseFloat(termEffectiveRate.toFixed(2));
        if (termEffectiveRate < offer.interestRate) {
          termEffectiveRate = offer.interestRate;
        }

        const promoMoPymtResp = this.calcMonthlyPayment(
          offer.promoInterestRate,
          offer.loanAmount,
          offer.downPayment,
          offer.promoTerm,
          requestId,
        );
        const promoEffectiveRateValue = this.aprRateCalculator(
          {
            loanAmount: offer.loanAmount,
            payment: promoMoPymtResp.monthlyPayment * -1,
            downPayment: offer.downPayment,
            term: offer.promoTerm,
          },
          requestId,
        );
        let promoEffectiveRate = 12 * promoEffectiveRateValue * 100;
        promoEffectiveRate = parseFloat(promoEffectiveRate.toFixed(2));
        if (promoEffectiveRate < offer.promoInterestRate) {
          promoEffectiveRate = offer.promoInterestRate;
        }

        const generatedOffer = {
          /** general **/
          adjWeightMax: offer.adjWeightMax,
          downPayment: offer.downPayment,
          dtiMax: offer.dtiMax,
          dtiMin: offer.dtiMin,
          ficoMax: offer.ficoMax,
          ficoMin: offer.ficoMin,
          financedAmount: parseFloat(
            (offer.loanAmount - offer.downPayment).toFixed(2),
          ),
          fundingSource: 'PLATFORM',
          grade: offer.grade,
          loanAmount: offer.loanAmount,
          loanId: offer.id,
          maxLoanAmt: offer.maxLoanAmount,
          minLoanAmt: offer.minLoanAmount,
          paymentFrequency: 'monthly',

          /** term **/
          apr: termEffectiveRate,
          decimalAmount: termMoPymtResp.decimalAmount,
          financeCharge: termMoPymtResp.financeCharge,
          fullNumberAmount: termMoPymtResp.fullNumberAmount,
          interestRate: offer.interestRate,
          monthlyPayment: termMoPymtResp.monthlyPayment,
          postDTI: parseFloat(
            (
              ((monthlyDebt + termMoPymtResp.monthlyPayment) / monthlyIncome) *
              100
            ).toFixed(2),
          ),
          term: offer.term,
          totalLoanAmount: termMoPymtResp.totalLoanAmount,

          /** promo **/
          promoApr: promoEffectiveRate,
          promoDecimalAmount: promoMoPymtResp.decimalAmount,
          promoFinanceCharge: promoMoPymtResp.financeCharge,
          promoFullNumberAmount: promoMoPymtResp.fullNumberAmount,
          promoInterestRate: offer.promoInterestRate,
          promoMonthlyPayment: promoMoPymtResp.monthlyPayment,
          promoPostDTI: parseFloat(
            (
              ((monthlyDebt + promoMoPymtResp.monthlyPayment) / monthlyIncome) *
              100
            ).toFixed(2),
          ),
          promoTerm: offer.promoTerm,
          promoTotalLoanAmount: promoMoPymtResp.totalLoanAmount,

          /** promo selected **/
          canUsePromo: true,
          promoSelected: false,
        };

        return generatedOffer;
      })
      .filter((offer) => {
        postDTI = offer.postDTI;
        return offer.postDTI >= offer.dtiMin && offer.postDTI <= offer.dtiMax;
      })
      .sort((a, b) => {
        if (a.term < b.term) {
          return -1;
        } else if (a.term > b.term) {
          return 1;
        } else {
          return 0;
        }
      });

    /** we should have normal offers at this point **/
    if (!result.offers.length) {
      const declineMessages = this.getDeclineMsgs(
        {
          neededDTI,
          postDTI,
          stateCode,
        },
        requestId,
      );

      result.declineReasons.push(declineMessages);
      this.logger.log(
        'Offers declined with result:',
        `${OffersService.name}#getPracticeOffers`,
        requestId,
        result,
      );
      return result;
    }

    this.logger.log(
      'Offers result:',
      `${OffersService.name}#getPracticeOffers`,
      requestId,
      result,
    );

    return result;
  }

  async selectOffer(selectOfferDto: SelectOfferDto, requestId: string) {
    const { loanId, promoSelected, screenTrackingId, skipAutoPay } =
      selectOfferDto;
    const screenTracking: ScreenTracking =
      await this.screenTrackingModel.findOne({
        id: screenTrackingId,
      });
    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${OffersService.name}#selectOffer`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found`,
          requestId,
        ),
      );
    }

    const selectedOffer: any = screenTracking.offers.find(
      (offer) => offer.loanId === loanId,
    );
    if (!selectedOffer) {
      this.logger.error(
        'Loan id not found',
        `${OffersService.name}#selectOffer`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Selected offer not found. Please try again.',
          requestId,
        ),
      );
    }
    selectedOffer.promoSelected = selectedOffer.canUsePromo
      ? promoSelected
      : false;
    screenTracking.offerData = selectedOffer;
    screenTracking.skipAutoPay = skipAutoPay;
    screenTracking.offers = screenTracking.offers.map((offer) => {
      if (offer.loanId === loanId) {
        offer.promoSelected = offer.canUsePromo ? promoSelected : false;
      }

      return offer;
    });
    await this.screenTrackingModel.save(screenTracking);
  }

  async getOffer(screenTrackingId: string, requestId: string) {
    const screenTracking = await this.screenTrackingModel.findOne({
      where: {
        id: screenTrackingId,
      },
      relations: ['user'],
    });

    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${OffersService.name}#getOffer`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found`,
          requestId,
        ),
      );
    }
    if (!screenTracking.user) {
      this.logger.error(
        'User for this screen tracking not found',
        `${OffersService.name}#getOffer`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking user record not found.',
          requestId,
        ),
      );
    }
    if (!screenTracking.offerData) {
      this.logger.error(
        'Offer data is not set',
        `${OffersService.name}#getOffer`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          `User doesn't not have an offer yet`,
          requestId,
        ),
      );
    }

    const response = { offer: screenTracking.offerData };
    this.logger.log(
      'Offer data:',
      `${OffersService.name}#selectOffer`,
      requestId,
      response,
    );

    return response;
  }
}
