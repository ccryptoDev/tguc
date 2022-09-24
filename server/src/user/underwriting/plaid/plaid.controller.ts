import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Readable } from 'stream';
import { PlaidService } from './plaid.service';
import { AppService } from '../../../app.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { Request, Response } from 'express';
import { PlaidrequestDto } from './validation/plaidrequest.dto';
import { UserService } from '../../services/user.service';

// @UseGuards(JwtAuthGuard)
@Controller('/api/plaid')
export class PlaidController {
  constructor(
    private readonly plaidService: PlaidService,
    private readonly userService: UserService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  @Post('createLinkToken')
  // @UseGuards(JwtAuthGuard)
  async createLinkToken(@Req() request: Request) {
    try {
      const response = await this.plaidService.createLinkToken(request.id);
      this.logger.log(
        'Creating plaid link:',
        `${PlaidController.name}#createLinkToken`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PlaidController.name}#createLinkToken`,
        request.id,
        error,
      );
      throw new HttpException(
        error.response?.data?.error_message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('plaid-report/:id')
  @UseGuards(JwtAuthGuard)
  async getAssetReportPDF(
    @Param('id') id: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const borrower = await this.userService.findOne({ id });
    if (!borrower) {
      throw new NotFoundException(`Borrower #${id} not found`);
    }
    const pdf = await this.plaidService.getAssetReport(borrower);
    if (pdf) {
      response.set({
        'Content-Type': 'application/pdf',
      });
      const stream = Readable.from(pdf);
      stream.pipe(response);
    }
    return null;
  }

  @Post('loginToPlaid')
  @UseGuards(JwtAuthGuard)
  async loginToPlaid(
    @Body() publicTokenDto: PlaidrequestDto,
    @Req() request: Request,
  ) {
    try {
      const response = await this.plaidService.loginToPlaid(
        request.user.id,
        publicTokenDto.public_token,
      );
      this.logger.log(
        'Creating plaid link:',
        `${PlaidController.name}#loginToPlaid`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PlaidController.name}#loginToPlaidError`,
        request.id,
        error.response?.data,
      );

      throw new HttpException(
        error.response?.data?.error_message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/welcome')
  @UseGuards(JwtAuthGuard)
  async sendWelcomeEmail(@Req() request: Request) {
    return await this.plaidService.sendWelcomeEmail(
      request.user.id,
      request.id,
    );
  }

  @Post('transactionsList/:userId')
  @UseGuards(JwtAuthGuard)
  async getTransactionsList(
    @Req() request: Request,
    @Param('userId') userId: string,
  ) {
    try {
      const incomes = [];
      const expenses = [];
      const response = {};
      const responseTrans = await this.plaidService.getTransactionList(
        request.id,
        userId,
      );
      responseTrans.transactions.forEach((tr) => {
        if (tr.amount > 0) {
          expenses.push({
            id: tr.transaction_id,
            date: tr.date,
            amount: Math.abs(tr.amount),
            description: tr.name,
            currency: '$',
          });
        } else {
          incomes.push({
            id: tr.transaction_id,
            date: tr.date,
            amount: Math.abs(tr.amount),
            description: tr.name,
            currency: '$',
          });
        }
      });
      response['incomes'] = incomes;
      response['expenses'] = expenses;
      response['startDate'] = responseTrans.startDate;
      response['endDate'] = responseTrans.endDate;
      response['transactions'] = responseTrans.transactions;
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PlaidController.name}#getTransactionsListE`,
        request.id,
        error,
      );
      throw new HttpException(
        error.response?.data?.error_message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
