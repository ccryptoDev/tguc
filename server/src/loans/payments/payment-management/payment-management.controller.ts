import {
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { PaymentManagementCronService } from './payment-management-cron.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api')
export class PaymentManagementController {
  constructor(
    private readonly paymentManagementCron: PaymentManagementCronService,
  ) {}

  @Post('test/checkExpiredApplications')
  async runAutomaticPayments() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException();
    }

    try {
      await this.paymentManagementCron.checkExpiredApplications();
    } catch (error) {
      throw error;
    }
  }

  @Post('test/runDelinquencyCron')
  async runDelinquencyCron() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException();
    }

    try {
      await this.paymentManagementCron.delinquencyCron();
    } catch (error) {
      throw error;
    }
  }
}
