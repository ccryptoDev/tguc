import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { GalileoService } from '../services/galileo.service';
import { ActivateAccountDto } from '../validation/activate-account.dto';
import { CashLoadDto } from '../validation/cash-load.dto';
import { BalanceTransferDto } from '../validation/balance-transfer.dto';
import { SimulateCardAuthorizationDto } from '../validation/simulate-card-authorization.dto';
import { SimulateCardSettleDto } from '../validation/simulate-card-settle.dto';
import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { LoggerService } from '../../../logger/services/logger.service';
// import { AccountOverViewDto } from '../validation/account-overview.dto';
// import { SetCreditLimitDto } from '../validation/set-credit-limit.dto';
import { Card } from '../entities/card.entity';
import { GetTransactionsByDatePipe } from '../validation/get-transactions-by-date.pipe';
import { GetTransactionsByDateDto } from '../validation/get-transactions-by-date.dto';
import { Roles } from '../../../authentication/roles/roles.decorator';
import { Role } from '../../../authentication/roles/role.enum';
import { RolesGuard } from '../../../authentication/roles/guards/roles.guard';
import { SetArchivedDto } from '../validation/set-archived.dto';
import { Transactions } from '../entities/transactions.entity';
import { SimulateCardAuthorizationResponse } from '../types/simulate-card-authorization.response';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { ErrorResponse } from '../../../types/error-response';
import { CreateAccountResponse } from '../types/create-account-response';
import { GetCardsResponse } from '../types/get-cards-response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class GalileoController {
  constructor(
    private readonly galileoService: GalileoService,
    private readonly logger: LoggerService,
  ) {}

  @ApiCreatedResponse({ type: CreateAccountResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('/api/cards/createAccount')
  async createAccount(@Req() request: Request) {
    try {
      const screenTrackingId = request.user.screenTracking;
      const response = await this.galileoService.createAccount(
        screenTrackingId,
        request.id,
      );
      this.logger.log(
        'Response status 201',
        `${GalileoController.name}#createAccount`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#createAccount`,
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
  @Post('/api/cards/cashLoad')
  async cashLoad(@Req() request: Request, @Body() cashLoadDto: CashLoadDto) {
    try {
      const screenTrackingId = request.user.screenTracking;
      await this.galileoService.cashLoad(
        screenTrackingId,
        cashLoadDto,
        request.id,
      );
      this.logger.log(
        'Response status 201',
        `${GalileoController.name}#cashLoad`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#cashLoad`,
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
  @Post('/api/cards/balanceTransfer')
  async balanceTransfer(
    @Req() request: Request,
    @Body() balanceTransferDto: BalanceTransferDto,
  ) {
    try {
      const screenTrackingId = request.user.screenTracking;
      await this.galileoService.balanceTransfer(
        screenTrackingId,
        balanceTransferDto,
        request.id,
      );
      this.logger.log(
        'Response status 201',
        `${GalileoController.name}#balanceTransfer`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#balanceTransfer`,
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
  @Post('/api/cards/activateAccount')
  async activateAccount(
    @Req() request: Request,
    @Body() activateAccountDto: ActivateAccountDto,
  ) {
    try {
      await this.galileoService.activateAccount(activateAccountDto);
      this.logger.log(
        'Response status 200',
        `${GalileoController.name}#activateAccount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#activateAccount`,
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
  @Post('/api/cards/freezeAccount')
  async freezeAccount(
    @Req() request: Request,
    @Body() activateAccountDto: ActivateAccountDto,
  ) {
    try {
      const screenTrackingId = request.user.screenTracking;
      await this.galileoService.freezeAccount(
        screenTrackingId,
        activateAccountDto,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${GalileoController.name}#freezeAccount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#freezeAccount`,
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
  @Post('/api/admin/dashboard/cards/freezeAccount/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @UseGuards(RolesGuard)
  async freezeAccountByScreenTrackingId(
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
    @Body() activateAccountDto: ActivateAccountDto,
  ) {
    try {
      await this.galileoService.freezeAccount(
        screenTrackingId,
        activateAccountDto,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${GalileoController.name}#freezeAccountByScreenTrackingIdAndAccountNumber`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#freezeAccountByScreenTrackingIdAndAccountNumber`,
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
  @Post('/api/cards/unfreezeAccount')
  async unfreezeAccount(
    @Req() request: Request,
    @Body() activateAccountDto: ActivateAccountDto,
  ) {
    try {
      const screenTrackingId = request.user.screenTracking;
      await this.galileoService.unfreezeAccount(
        screenTrackingId,
        activateAccountDto,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${GalileoController.name}#unfreezeAccount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#unfreezeAccount`,
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
  @Post('/api/admin/dashboard/cards/unfreezeAccount/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @UseGuards(RolesGuard)
  async unfreezeAccountByScreenTrackingId(
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
    @Body() activateAccountDto: ActivateAccountDto,
  ) {
    try {
      await this.galileoService.unfreezeAccount(
        screenTrackingId,
        activateAccountDto,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${GalileoController.name}#unfreezeAccountByScreenTrackingId`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#unfreezeAccountByScreenTrackingId`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('/api/admin/dashboard/cards/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @UseGuards(RolesGuard)
  async getCardsByScreenTrackingId(
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
  ) {
    try {
      const response = await this.galileoService.getCards(
        screenTrackingId,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${GalileoController.name}#getCardsByScreenTrackingId`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#getCardsByScreenTrackingId`,
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
  @Post('/api/cards/activateCard')
  async activateCard(@Body() activateAccountDto: ActivateAccountDto) {
    await this.galileoService.activateCard(activateAccountDto);
  }

  @ApiCreatedResponse({ type: SimulateCardAuthorizationResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('/api/cards/simulateCardAuthorization')
  async simulateCardAuthorization(
    @Req() request: Request,
    @Body() simulateCardAuthorizationDto: SimulateCardAuthorizationDto,
  ) {
    try {
      const screenTrackingId = request.user.screenTracking;
      const response = await this.galileoService.simulateCardAuthorization(
        screenTrackingId,
        simulateCardAuthorizationDto,
        request.id,
      );
      this.logger.log(
        'Response status 201',
        `${GalileoController.name}#simulatedCardAuthorization`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#simulatedCardAuthorization`,
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
  @Post('/api/cards/simulateCardSettle')
  async simulateCardSettle(
    @Req() request: Request,
    @Body() simulateCardSettleDto: SimulateCardSettleDto,
  ) {
    try {
      const screenTrackingId = request.user.screenTracking;
      await this.galileoService.simulateCardSettle(
        screenTrackingId,
        simulateCardSettleDto,
        request.id,
      );
      this.logger.log(
        'Response status 201',
        `${GalileoController.name}#simulateCardSettle`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#simulateCardSettle`,
        request.id,
        error,
      );
      throw error;
    }
  }

  //! Not being used for now
  // @Get('/api/cards/getCard/:accountNumber')
  // getCard(@Param('accountNumber') accountNumber: string) {
  //   return this.galileoService.getCard(accountNumber);
  // }
  //! Not being used for now
  // @Get('/api/cards/getBalance/:accountNumber')
  // getBalance(@Param('accountNumber') accountNumber: string) {
  //   return this.galileoService.getBalance(accountNumber);
  // }

  @ApiOkResponse({ type: GetCardsResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('/api/cards')
  async getCards(@Req() request: Request): Promise<Record<string, any>> {
    try {
      const screenTrackingId = request.user.screenTracking;
      const response: Card[] = await this.galileoService.getCards(
        screenTrackingId,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${GalileoController.name}#getCards`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#getCards`,
        request.id,
        error,
      );
      throw error;
    }
  }

  //! Not being used for now
  // @Post('/api/cards/accountOverview')
  // async getAccountOverview(
  //   @Req() request: Request,
  //   @Body() accountOverviewDto: AccountOverViewDto,
  // ): Promise<Record<string, any>> {
  //   try {
  //     const screenTrackingId = request.user.screenTracking;
  //     const response = await this.galileoService.getAccountOverview(
  //       screenTrackingId,
  //       accountOverviewDto,
  //       request.id,
  //     );
  //     this.logger.log(
  //       'Response status 200',
  //       `${GalileoController.name}#getAccountOverview`,
  //       request.id,
  //     );

  //     return response;
  //   } catch (error) {
  //     this.logger.error(
  //       'Error:',
  //       `${GalileoController.name}#getAccountOverview`,
  //       request.id,
  //       error,
  //     );
  //     throw error;
  //   }
  // }

  @Get('/api/cards/transactions/:cardId')
  async getTransactions(
    @Req() request: Request,
    @Param('cardId') cardId: string,
    @Query(new GetTransactionsByDatePipe())
    getTransactionsByDateDto: GetTransactionsByDateDto,
  ) {
    try {
      const screenTrackingId = request.user.screenTracking;
      const response: Transactions[] =
        await this.galileoService.getTransactions(
          screenTrackingId,
          cardId,
          getTransactionsByDateDto,
          request.id,
        );
      this.logger.log(
        'Response status 200',
        `${GalileoController.name}#getTransactions`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#getTransactions`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('/api/admin/dashboard/cards/transactions/:screenTrackingId/:cardId')
  async getTransactionsByScreenTrackingId(
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
    @Param('cardId') cardId: string,
    @Query(new GetTransactionsByDatePipe())
    getTransactionsByDateDto: GetTransactionsByDateDto,
  ) {
    try {
      const response = await this.galileoService.getTransactions(
        screenTrackingId,
        cardId,
        getTransactionsByDateDto,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${GalileoController.name}#getTransactions`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#getTransactions`,
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
  @Patch('/api/admin/dashboard/cards/archive/:cardId')
  async setCardArchived(
    @Req() request: Request,
    @Param('cardId') cardId: string,
    @Body() setArchivedDto: SetArchivedDto,
  ) {
    try {
      const response = await this.galileoService.setArchived(
        cardId,
        setArchivedDto,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${GalileoController.name}#setCardArchived`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${GalileoController.name}#setCardArchived`,
        request.id,
        error,
      );
      throw error;
    }
  }

  //! Not being used for now
  // @Post('/api/cards/setCreditLimit')
  // async setCreditLimit(
  //   @Req() request: Request,
  //   @Body() setCreditLimitDto: SetCreditLimitDto,
  // ): Promise<Record<string, any>> {
  //   try {
  //     const screenTrackingId = request.user.screenTracking;
  //     const response = await this.galileoService.setCreditLimit(
  //       screenTrackingId,
  //       setCreditLimitDto,
  //       request.id,
  //     );
  //     this.logger.log(
  //       'Response status 201',
  //       `${GalileoController.name}#setCreditLimit`,
  //       request.id,
  //     );

  //     return response;
  //   } catch (error) {
  //     this.logger.error(
  //       'Error:',
  //       `${GalileoController.name}#setCreditLimit`,
  //       request.id,
  //       error,
  //     );
  //     throw error;
  //   }
  // }
}
