import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../../../../authentication/roles/role.enum';
import { Roles } from '../../../../authentication/roles/roles.decorator';
import { RolesGuard } from '../../../../authentication/roles/guards/roles.guard';
import { LoggerService } from '../../../../logger/services/logger.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../../authentication/strategies/jwt-auth.guard';
import { PracticeManagementService } from '../services/practice-management.service';
import GetAllPracticeManagementsDto from '../validation/getAllPracticeManagements.dto';
import { GetAllPracticeManagementsPipe } from '../validation/getAllPracticeManagements.pipe';
import AddPracticeManagementDto from '../validation/addPracticeManagement.dto';
import UpdatePracticeManagementDto from '../validation/updatePracticeManagement.dto';
import { UpdatePracticeManagementPipe } from '../validation/updatePracticeManagement.pipe';
import { AdminJwtPayload } from '../../../../authentication/types/jwt-payload.types';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../log-activity/services/log-activity.service';
import { BadRequestResponse } from '../../../../types/bad-request-response';
import { ErrorResponse } from '../../../../types/error-response';
import { GetAllPracticeManagementsResponse } from '../../types/get-all-practice-managements-response';

@ApiBearerAuth()
@Controller('/api/admin/dashboard/practiceManagements')
export class PracticeManagementController {
  constructor(
    private readonly practiceManagementService: PracticeManagementService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) {}

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('merchants/:url')
  async getPracticeManagementByURL(
    @Req() request: Request,
    @Param('url') url: string,
  ) {
    try {
      const response =
        await this.practiceManagementService.getPracticeManagementByURL(
          url,
          request.id,
        );
      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#getPracticeManagementByName`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#getPracticeManagementByName`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @Get('names')
  async getNames(@Req() request: Request) {
    try {
      const response = await this.practiceManagementService.getAllNames(
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#getNames`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#getNames`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetAllPracticeManagementsResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @Get()
  async getAllPracticeManagements(
    @Req() request: Request,
    @Query(new GetAllPracticeManagementsPipe())
    getAllPracticeManagementsDto: GetAllPracticeManagementsDto,
  ) {
    try {
      const response =
        await this.practiceManagementService.getAllPracticeManagements(
          getAllPracticeManagementsDto,
          request.id,
        );
      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#getAllPracticeManagements`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#getAllPracticeManagements`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @Post()
  async addPracticeManagement(
    @Body()
    addPracticeManagementDto: AddPracticeManagementDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response =
        await this.practiceManagementService.addPracticeManagement(
          addPracticeManagementDto,
          request.id,
        );
      const { id, userName, email, role } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.MANAGE_PRACTICES,
        `${request.user.email} - ${role} Added new practice id ${response.practiceManagementId}`,
        {
          id,
          email,
          role,
          userName,
          practiceName: addPracticeManagementDto.practiceName,
          contactName: addPracticeManagementDto.contactName,
          address: addPracticeManagementDto.address,
          city: addPracticeManagementDto.city,
          location: addPracticeManagementDto.location,
          stateCode: addPracticeManagementDto.stateCode,
          zipCode: addPracticeManagementDto.zip,
          phone: addPracticeManagementDto.phone,
          url: addPracticeManagementDto.url,
        },
      );

      this.logger.log(
        'Response status 201',
        `${PracticeManagementController.name}#addPracticeManagement`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#addPracticeManagement`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @Get(':id')
  async getPracticeManagement(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    try {
      const response =
        await this.practiceManagementService.getPracticeManagementById(
          id,
          request.id,
        );
      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#getPracticeManagement`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#getPracticeManagement`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @Patch(':id')
  @UsePipes(new UpdatePracticeManagementPipe())
  async updatePracticeManagement(
    @Param('id') id: string,
    @Body() updatePracticeManagementDto: UpdatePracticeManagementDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response =
        await this.practiceManagementService.updatePracticeManagementById(
          id,
          updatePracticeManagementDto,
          request.id,
        );
      const {
        id: AdminId,
        userName,
        email,
        role,
        practiceManagement,
      } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.MANAGE_PRACTICES,
        `${request.user.email} - ${role} Edited practice id ${id}`,
        {
          id: AdminId,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          newPracticeAddress: updatePracticeManagementDto.address,
          newPracticeRegion: updatePracticeManagementDto.region,
          newPracticeCity: updatePracticeManagementDto.city,
          newPracticeLocation: updatePracticeManagementDto.location,
          newPracticeRegionalManager:
            updatePracticeManagementDto.regionalManager,
          newPracticeManagementRegion:
            updatePracticeManagementDto.managementRegion,
          newPracticeState: updatePracticeManagementDto.stateCode,
          newPracticeZipCode: updatePracticeManagementDto.zip,
          newPracticePhoneNumber: updatePracticeManagementDto.phone,
        },
      );

      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#updatePracticeManagement`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#updatePracticeManagement`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
