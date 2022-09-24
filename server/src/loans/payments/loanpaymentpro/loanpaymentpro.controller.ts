import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { LoggerService } from '../../../logger/services/logger.service';
import { LoanpaymentproService } from './loanpaymentpro.service';
import { LoanPaymentProCardToken } from './loanpaymentpro-card-token.entity';
import { AddCardDto } from './validation/addCard.dto';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { ErrorResponse } from '../../../types/error-response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/application/')
export class LoanpaymentproController {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly logger: LoggerService,
  ) {}

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('addCard')
  @UsePipes(new ValidationPipe())
  async addCard(@Body() addCardDto: AddCardDto, @Req() request: Request) {
    const user = request.user.id;
    addCardDto.screenTrackingId = request.user.screenTracking;
    try {
      const response: LoanPaymentProCardToken =
        await this.loanPaymentProService.v2PaymentCardsAdd(
          addCardDto,
          request.id,
        );

      await this.screenTrackingModel.update(
        { user },
        {
          lastLevel: 'document-upload',
        },
      );

      this.logger.log(
        'Response status 201:',
        `${LoanpaymentproController.name}#addCard`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LoanpaymentproController.name}#addCard`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
