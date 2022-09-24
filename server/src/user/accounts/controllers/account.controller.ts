import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { LoggerService } from '../../../logger/services/logger.service';
import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { Role } from '../../../authentication/roles/role.enum';
import { Roles } from '../../../authentication/roles/roles.decorator';
import { AccountsService } from '../services/account.service';
import { AddAccountDto } from '../validation/add-account.dto';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { ErrorResponse } from '../../../types/error-response';
import { AddAccountResponse } from '../types/add-account-response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly logger: LoggerService,
  ) {}

  @ApiCreatedResponse({ type: AddAccountResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('/application/addAccount')
  @UsePipes(new ValidationPipe())
  async addAccount(
    @Body() addAccountDto: AddAccountDto,
    @Req() request: Request,
  ) {
    const { id, screenTracking } = request.user;
    addAccountDto.screenTrackingId = screenTracking;
    addAccountDto.userId = id;

    try {
      const response = await this.accountsService.addAccount(
        addAccountDto,
        request.id,
      );

      this.logger.log(
        'Response status 201:',
        `${AccountsController.name}#addAccount`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AccountsController.name}#addAccount`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('/admin/dashboard/user/accounts/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff)
  @UsePipes(new ValidationPipe())
  async getUserAccountsByScreenTrackingId(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request,
  ) {
    try {
      const response =
        await this.accountsService.getUserAccountsByScreenTrackingId(
          screenTrackingId,
          request.id,
        );

      this.logger.log(
        'Response status 200:',
        `${AccountsController.name}#getUserAccountsByScreenTrackingId`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AccountsController.name}#addAccount`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
