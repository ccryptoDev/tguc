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
import { LoanInterestRate } from '../../../../loans/entities/interest-rate.entity';
import { JwtAuthGuard } from '../../../../authentication/strategies/jwt-auth.guard';
import { LoggerService } from '../../../../logger/services/logger.service';
import { AppService } from '../../../../app.service';
import { PaymentManagementService } from '../../../../loans/payments/payment-management/payment-management.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExperianCreditInquiryDto } from '../validation/experianCreditInquiry.dto';
import { ExperianService } from '../services/experian.service';
import { ExperianHistory } from '../entities/experian-history.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class ExperianController {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,

    @InjectRepository(ExperianHistory)
    private readonly experianHistoryModel: Repository<ExperianHistory>,

    private readonly experianService: ExperianService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly productService: ProductService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  @Post('experianCreditInquiry')
  @UsePipes(new ValidationPipe())
  async experianCreditInquiry(
    @Body() creditInquiryDto: ExperianCreditInquiryDto,
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
          `${ExperianController.name}#creditBureauInquiry`,
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
          `${ExperianController.name}#creditBureauInquiry`,
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

      const experianHistory: ExperianHistory =
        await this.experianHistoryModel.findOne({
          where: {
            screenTracking: creditInquiryDto.screenTrackingId,
          },
        });

      if (experianHistory) {
        const errorMessage = 'User already has a credit report';
        this.logger.error(
          errorMessage,
          `${ExperianController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new ForbiddenException(
          this.appService.errorHandler(403, errorMessage, request.id),
        );
      }

      const creditReportResponse =
        await this.experianService.creditReportInquiry(
          screenTracking,
          user,
          request.id,
        );

      return creditReportResponse;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ExperianController.name}#creditBureauInquiry`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
