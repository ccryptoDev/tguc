import { Get, HttpCode, Param, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { Body } from '@nestjs/common';
import {
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../../../logger/services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { Role } from '../../../authentication/roles/role.enum';
import { Roles } from '../../../authentication/roles/roles.decorator';
import { RolesGuard } from '../../../authentication/roles/guards/roles.guard';
import { PaymentCronService } from '../services/payment-cron.service';
import { PaymentManagementService } from '../payment-management/payment-management.service';
import { PaymentService } from '../services/payment.service';
import { MakePaymentDto } from '../validation/makePayment.dto';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { AdminJwtPayload } from '../../../authentication/types/jwt-payload.types';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { ErrorResponse } from '../../../types/error-response';

@Controller('/api')
export class PaymentController {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly paymentService: PaymentService,
    private readonly paymentCronService: PaymentCronService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly logger: LoggerService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('test/automaticPayment')
  async runAutomaticPayments() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException();
    }

    try {
      await this.paymentCronService.makeAutomaticPayment();
    } catch (error) {
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('application/makePayment')
  @UsePipes(new ValidationPipe())
  async makePayment(
    @Body() makePaymentDto: MakePaymentDto,
    @Req() request: Request,
  ) {
    const { amount, paymentMethodToken } = makePaymentDto;
    const { id: userId, screenTracking } = request.user;

    try {
      await this.paymentService.makeDownPayment(
        userId,
        screenTracking,
        amount,
        paymentMethodToken,
        request.id,
      );

      await this.paymentManagementService.setInRepaymentNonPrimeStatus(
        userId,
        request.id,
      );

      this.logger.log(
        'Response status 201:',
        `${PaymentController.name}#makePayment`,
        request.id,
      );
    } catch (error) {
      // Will only move the user forward in the application process when the down-payment goes through
      await this.screenTrackingModel.update(
        { user: userId },
        {
          lastLevel: 'repayment',
        },
      );
      this.logger.error(
        'Error:',
        `${PaymentController.name}#makePayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('application/getpaymentschedule/:token')
  async getPayments(@Req() request: Request, @Param('token') token: string) {
    this.logger.log(
      'Request params:',
      `${PaymentController.name}#getPayments`,
      request.id,
    );

    try {
      const stats = await this.paymentService.getPaymentSchedule(
        request,
        token,
      );

      this.logger.log(
        'Return data:',
        `${PaymentController.name}#getPayments`,
        request.id,
        stats,
      );

      return stats;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#getPayments`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  @Post('application/partialreturn')
  async partialReturnDetails(
    @Req() request: Request & { user: AdminJwtPayload },
    @Body('email') email: string,
    @Body('amount') amount: number,
  ) {
    try {
      await this.paymentService.partialReturnData(request, email, amount);
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#partialReturnDetails`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('application/refundPayment')
  async refundPayment(@Body('token') token: string, @Req() request: Request) {
    try {
      await this.paymentService.refundPaymentData(request, token);
      this.logger.log(
        'Response status 201:',
        `${PaymentController.name}#refundPayment`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#refundPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
