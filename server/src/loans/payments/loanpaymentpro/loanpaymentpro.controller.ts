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
import { Card } from '../../../user/cards/entities/card.entity';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { ErrorResponse } from '../../../types/error-response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/application/')
export class LoanpaymentproController {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(Card)
    private readonly cardModel : Repository<Card>,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly logger: LoggerService,
  ) {}

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('addCard')
  @UsePipes(new ValidationPipe())
  async addCard(@Body() data: any, @Req() request: Request) {
    const user = request.user.id;
    data.screenTrackingId = request.user.screenTracking;
    try {
      /*const response: LoanPaymentProCardToken =
        await this.loanPaymentProService.v2PaymentCardsAdd(
          addCardDto,
          request.id,
        );*/
        let response;
        let obj = {
          screenTracking: data?.screenTrackingId,
          cardNumber : data?.cardNumber?.value,
          cardName : data?.fullName?.value,
          accountNumber : data?.accountNumber?.value,
          routingNumber : data?.routingNumber?.value,
          financialInstitution : data?.financialInstitution?.value,
          accountType : data?.accountType?.value,
          manualPayment : data?.manualPayment?.value,
          expiryDate : data?.expirationDate?.value,
          securityCode : data?.securityCode?.value,
          billingAddress1 : data?.street?.value,
          billingCity : data?.city?.value,
          billingFirstName: data?.firstName?.value,
          billingLastName : data?.lastName?.value,
          billingState : data?.state?.value,
          billingZip : data?.zipCode?.value
        }
      let exist = await this.cardModel.findOne({screenTracking: data.screenTrackingId});
      if (exist) {
        response = await this.cardModel.update(exist.id,
          obj
        )
      } else {
        let create = await this.cardModel.create(obj);
        response = await this.cardModel.save(create);
      }
      await this.screenTrackingModel.update(
        { user },
        {
          lastScreen: 'sign-contract',
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
