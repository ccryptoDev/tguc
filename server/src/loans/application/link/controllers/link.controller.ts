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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../authentication/strategies/jwt-auth.guard';
import { LoggerService } from '../../../../logger/services/logger.service';
import { ApplicationLinkService } from '../services/link.service';
import { CreateLinkDto } from '../validation/createLink.dto';
import { GetLinkDto } from '../validation/getLink.dto';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../../../admin/dashboard/log-activity/services/log-activity.service';
import { AdminJwtPayload } from '../../../../authentication/types/jwt-payload.types';
import { BadRequestResponse } from '../../../../types/bad-request-response';
import { ErrorResponse } from '../../../../types/error-response';
import { CreateApplicationLinkResponse } from '../types/create-application-link-response';

@Controller('/api/admin/dashboard/application/link')
export class LinkController {
  constructor(
    private readonly applicationLinkService: ApplicationLinkService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateApplicationLinkResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async createApplicationLink(
    @Body() createLinkDto: CreateLinkDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.applicationLinkService.createLinkRecord(
        createLinkDto,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.APPLICATION_LINK,
        `${request.user.email} - ${role} Sent application link id ${response.applicationLinkUrl}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          applicationLinkUrl: response.applicationLinkUrl,
          firstName: createLinkDto.firstName,
          lastName: createLinkDto.lastName,
          phone: createLinkDto.phone,
          practiceManagement: createLinkDto.practiceManagement,
        },
      );

      this.logger.log(
        'Response status 201',
        `${LinkController.name}#createApplicationLink`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LinkController.name}#createApplicationLink`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get(':id')
  @UsePipes(new ValidationPipe())
  async getApplicationLink(
    @Param() getLinkDto: GetLinkDto,
    @Req() request: Request,
  ) {
    try {
      const response = await this.applicationLinkService.getLinkRecord(
        getLinkDto,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${LinkController.name}#getApplicationLink`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LinkController.name}#getApplicationLink`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
