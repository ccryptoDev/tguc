import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Request } from 'express';
import { PracticeManagement } from '../../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { ScreenTracking } from '../../../screen-tracking/entities/screen-tracking.entity';
import { User } from '../../../entities/user.entity';
import { ProductService } from '../../product/services/product.service';
import { TransunionService } from '../services/transunion.service';
import { CreditInquiryDto } from '../validation/creditInquiry.dto';
import { LoanInterestRate } from '../../../../loans/entities/interest-rate.entity';
import { JwtAuthGuard } from '../../../../authentication/strategies/jwt-auth.guard';
import { LoggerService } from '../../../../logger/services/logger.service';
import { AppService } from '../../../../app.service';
import { PaymentManagementService } from '../../../../loans/payments/payment-management/payment-management.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditInquiryResponse } from '../types/credit-inquiry-response';
import { BadRequestResponse } from '../../../../types/bad-request-response';
import { ErrorResponse } from '../../../../types/error-response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class TransunionController {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(PracticeManagement)
    private readonly practiceManagementModel: Repository<PracticeManagement>,
    @InjectRepository(LoanInterestRate)
    private readonly loanInterestRateModel: Repository<LoanInterestRate>,
    private readonly transUnionService: TransunionService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly productService: ProductService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  @ApiCreatedResponse({ type: CreditInquiryResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('creditBureauInquiry')
  @UsePipes(new ValidationPipe())
  async creditBureauInquiry(
    @Body() creditInquiryDto: CreditInquiryDto,
    @Req() request: Request,
  ) {
    creditInquiryDto.screenTrackingId = request.user.screenTracking;
    try {
      const screenTracking: ScreenTracking =
        await this.screenTrackingModel.findOne({
          where: {
            id: creditInquiryDto.screenTrackingId,
          },
          relations: ['user', 'practiceManagement'],
        });

      if (!screenTracking) {
        this.logger.error(
          'Screen tracking not found',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Screen tracking id ${screenTracking} not found`,
            request.id,
          ),
        );
      }

      const user = screenTracking.user as User;
      if (!user) {
        this.logger.error(
          'User not found',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            'user for this screen tracking not found',
            request.id,
          ),
        );
      }
      const practiceManagement = await this.practiceManagementModel.findOne({
        where: {
          id: (screenTracking.practiceManagement as PracticeManagement).id,
        },
      });
      if (!practiceManagement) {
        this.logger.error(
          'Practice management not found',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            'practiceManagement for this screen tracking not found',
            request.id,
          ),
        );
      }
      if (
        (screenTracking.creditScore && screenTracking.creditScore >= 0) ||
        screenTracking.deniedMessage
      ) {
        const errorMessage = 'User already has a credit report';
        this.logger.error(
          errorMessage,
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new ForbiddenException(
          this.appService.errorHandler(403, errorMessage, request.id),
        );
      }

      const creditReportResponse = await this.transUnionService.runCreditReport(
        creditInquiryDto.hardPull,
        screenTracking,
        user,
        request.id,
      );

      const creditReport =
        creditReportResponse.transUnionHistory?.responseData?.creditBureau;
      if (!creditReport) {
        this.logger.error(
          'No credit report',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            'Error attempting to retrieve your credit details.',
            request.id,
          ),
        );
      }

      const stage1Rules = await this.productService.getStage1Rules(
        user,
        screenTracking,
        request.id,
      );
      const stage2Rules = await this.productService.getStage2Rules(
        creditReport,
        (screenTracking.practiceManagement as PracticeManagement).id,
        request.id,
      );

      const rulesDetails = {
        approvedRuleMsg: [
          ...stage1Rules.approvedRuleMsg,
          ...stage2Rules.approvedRuleMsg,
        ],
        declinedRuleMsg: [
          ...stage1Rules.declinedRuleMsg,
          ...stage2Rules.declinedRuleMsg,
        ],
        ruleData: {
          ...stage1Rules.ruleData,
          ...stage2Rules.ruleData,
        },
        // ...stage1Rules.ruleApprovals,
        // ...stage2Rules.ruleApprovals,
        loanApproved: stage1Rules.loanApproved,
        totalAdjWeight: stage2Rules.totalAdjWeight,
      };

      const screenUpdateObj: any = {
        adjRulesWeight: rulesDetails.totalAdjWeight,
        creditScore: creditReportResponse.creditScore || 0,
        incomeAmount: '' + parseFloat(screenTracking.incomeAmount + '' || '0'),
        lastLevel: rulesDetails.loanApproved ? 'offers' : 'denied',
        product: this.productService.getProductId(),
        rulesDetails: rulesDetails,
      };
      const lowestGradeLoanInterestRate =
        await this.loanInterestRateModel.findOne({
          where: {
            stateCode: practiceManagement.stateCode,
          },
          order: {
            grade: 'DESC',
          },
        });
      const creditReportError = creditReport.product.error;
      const transunionError =
        creditReportResponse.transUnionHistory.responseData.error;
      let lockToLowestTier = false;
      if (creditReportError) {
        screenUpdateObj.deniedMessage = `Application assigned to tier ${lowestGradeLoanInterestRate.grade} due to: ${creditReport.product.error.description}`;
        lockToLowestTier = true;
      }
      if (transunionError) {
        screenUpdateObj.deniedMessage = `Application assigned to tier ${lowestGradeLoanInterestRate.grade} due to: ${transunionError.errortext} (Error code: ${transunionError.errorcode})`;
        lockToLowestTier = true;
      }
      if (lockToLowestTier) {
        screenUpdateObj.lockCreditTier = lowestGradeLoanInterestRate.grade;
      }
      await this.screenTrackingModel.update(
        { id: screenTracking.id },
        screenUpdateObj,
      );

      const response = { isLoanApproved: false };
      if (!rulesDetails.loanApproved) {
        await this.paymentManagementService.createPaymentManagement(
          screenTracking,
          'denied',
          request.id,
        );
      } else {
        response.isLoanApproved = true;
      }

      this.logger.log(
        'Response status 201',
        `${TransunionController.name}#creditBureauInquiry`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${TransunionController.name}#creditBureauInquiry`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
