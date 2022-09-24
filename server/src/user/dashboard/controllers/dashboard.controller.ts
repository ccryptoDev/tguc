import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { User } from '../../entities/user.entity';
import { LoggerService } from '../../../logger/services/logger.service';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../../admin/dashboard/log-activity/services/log-activity.service';
import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';
import { MakePaymentDialogPipe } from '../../../admin/dashboard/pipes/makePaymentDialog.pipe';
import { MakePaymentDialogDto } from '../../../admin/dashboard/dtos/makePaymentDialog.dto';
import { SubmitPaymentDto } from '../../../admin/dashboard/dtos/submit-payment.dto';
import { ChangePaymentAmountDto } from '../../../admin/dashboard/dtos/change-payment-amount.dto';
import { EnableAutopayDto } from '../../../admin/dashboard/dtos/enable-autopay.dto';
import { PaymentService } from '../../../loans/payments/services/payment.service';
import { ErrorResponse } from '../../../types/error-response';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { GetDashboardResponse } from '../types/get-dashboard-response';
import { PreviewPaymentResponse } from '../../../types/preview-payment-response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class DashboardController {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly paymentService: PaymentService,
    private readonly dashboardService: DashboardService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOkResponse({ type: GetDashboardResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('dashboard')
  @UsePipes(new ValidationPipe())
  async getDashboard(@Req() request: Request) {
    const userId = request.user.id;
    try {
      const response = await this.dashboardService.getDashboard(
        userId,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#getDashboard`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#getDashboard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: PreviewPaymentResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('dashboard/previewPayment')
  @UsePipes(new ValidationPipe())
  async previewPayment(
    @Body(new MakePaymentDialogPipe()) makePaymentDto: MakePaymentDialogDto,
    @Req() request: Request,
  ) {
    try {
      const response = await this.paymentService.makePaymentRenderDialog(
        makePaymentDto,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#previewPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#previewPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('dashboard/submitPayment')
  @UsePipes(new ValidationPipe())
  async submitPayment(
    @Body(new MakePaymentDialogPipe()) submitPaymentDto: SubmitPaymentDto,
    @Req() request: Request,
  ) {
    const screenTrackingId = submitPaymentDto.screenTracking;
    try {
      const response = await this.paymentService.submitPayment(
        submitPaymentDto,
        request.id,
      );

      const userInfo = request.user;
      if (response) {
        await this.logActivityService.createLogActivityUpdateUser(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${userInfo.email} - ${userInfo.role} Made payment with amount ${response.amount}. Payment reference ${response.paymentReference}. Payment id ${response.id}`,
          {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
            userName: userInfo.firstName + userInfo.lastName,
            screenTrackingId,
            paymentId: response.id,
            paymentManagementId: response.paymentManagement as string,
            paymentStatus: response.status,
            customerPracticeManagementId: response.practiceManagement as string,
          },
          screenTrackingId,
          userInfo.id,
        );
      } else {
        await this.logActivityService.createLogActivityUpdateUser(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${userInfo.email} - ${userInfo.role} Scheduled payment for ${moment(
            submitPaymentDto.paymentDate,
          ).format('MM/DD/YYYY')} with amount ${submitPaymentDto.amount}`,
          {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
            userName: userInfo.firstName + userInfo.lastName,
            screenTrackingId,
          },
          screenTrackingId,
          userInfo.id,
        );
      }

      this.logger.log(
        'Response status 201',
        `${DashboardController.name}#submitPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#submitPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @HttpCode(204)
  @Patch('dashboard/changePaymentAmount')
  @UsePipes(new ValidationPipe())
  async changePaymentAmount(
    @Body(new ValidationPipe()) changePaymentAmountDto: ChangePaymentAmountDto,
    @Req() request: Request,
  ) {
    const screenTrackingId = changePaymentAmountDto.screenTracking;

    try {
      await this.dashboardService.changeMonthlyPaymentAmount(
        changePaymentAmountDto,
        request.id,
      );
      const userInfo = request.user;
      await this.logActivityService.createLogActivityUpdateUser(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${userInfo.email} - ${userInfo.role} Changed current payment amount to ${changePaymentAmountDto.amount}`,
        {
          id: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
          userName: userInfo.firstName + userInfo.lastName,
          screenTrackingId,
        },
        screenTrackingId,
        userInfo.id,
      );

      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#changePaymentAmount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#changePaymentAmount`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @HttpCode(204)
  @Patch('dashboard/enableAutopay')
  @UsePipes(new ValidationPipe())
  async enableAutopay(
    @Body(new ValidationPipe()) enableAutopayDto: EnableAutopayDto,
    @Req() request: Request,
  ) {
    const paymentManagementId = enableAutopayDto.paymentManagementId;
    try {
      await this.dashboardService.enableAutopay(paymentManagementId);
      const userInfo = request.user;
      await this.logActivityService.createLogActivityUpdateUser(
        request,
        logActivityModuleNames.ACCOUNTS,
        `${userInfo.email} - ${userInfo.role} enabled Auto Payment`,
        {
          id: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
          userName: userInfo.firstName + userInfo.lastName,
          screenTrackingId: userInfo.screenTracking,
        },
        userInfo.screenTracking,
        userInfo.id,
      );

      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#enableAutopay`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#enableAutopay`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
