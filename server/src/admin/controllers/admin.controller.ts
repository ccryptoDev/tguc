import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { LoggerService } from '../../logger/services/logger.service';
import { JwtAuthGuard } from '../../authentication/strategies/jwt-auth.guard';
import { Role } from '../../authentication/roles/role.enum';
import { Roles } from '../../authentication/roles/roles.decorator';
import { RolesGuard } from '../../authentication/roles/guards/roles.guard';
import { AdminJwtPayload } from '../../authentication/types/jwt-payload.types';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../dashboard/log-activity/services/log-activity.service';
import { AdminService } from '../services/admin.service';
import GetAllUsersDto from '../dashboard/validation/GetAllUsers.dto';
import { GetAllUsersPipe } from '../dashboard/validation/GetAllUsers.pipe';
import { CreateAdminDto } from '../validation/create-admin.dto';
import { UpdateAdminDto } from '../validation/update-admin.dto';
import { ErrorResponse } from '../../types/error-response';
import { BadRequestResponse } from '../../types/bad-request-response';
import { CreateAdminResponse } from '../types/create-admin-response';
import { GetAllAdminsResponse } from '../types/get-all-admins-response';
import { AdminWithoutPassword } from '../types/admin-without-password';

@ApiBearerAuth()
@Controller('/api/admin/dashboard/')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) { }

  @ApiCreatedResponse({ type: CreateAdminResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @Post('admins')
  @UsePipes(new ValidationPipe())
  async createAdmin(
    @Body() createUserDto: CreateAdminDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      createUserDto.initialPassword = createUserDto.password;
      const response = await this.adminService.createAdmin(
        createUserDto,
        request.user,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.MANAGE_USERS,
        `${request.user.email} - ${role} Added new user with username ${createUserDto.userName} and email ${createUserDto.email}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          newAdminId: response.adminId,
          newAdminUserName: createUserDto.userName,
          newAdminEmail: createUserDto.email,
          newAdminPhoneNumber: createUserDto.phoneNumber,
          newAdminRole: createUserDto.role,
          newAdminPracticeManagement: createUserDto.practiceManagement,
        },
      );
      this.logger.log(
        'Response status 201',
        `${AdminController.name}#createAdmin`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#createAdmin`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetAllAdminsResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager)
  @Get('admins')
  async getAllAdmins(
    @Req() request: Request & { user: AdminJwtPayload },
    @Query(new GetAllUsersPipe()) getAllAdminsDto: GetAllUsersDto,
  ) {
    try {
      const response = await this.adminService.getAllAdmins(
        request.user,
        getAllAdminsDto,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${AdminController.name}#getAllAdmins`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#getAllAdmins`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetAllAdminsResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @Get('agents')
  async getAllAgents(
    @Req() request: Request & { user: AdminJwtPayload },
    @Query(new GetAllUsersPipe()) getAllAdminsDto: GetAllUsersDto,
  ) {
    try {
      const response = await this.adminService.getAllAgents(
        request.user,
        getAllAdminsDto,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${AdminController.name}#getAllAdmins`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#getAllAdmins`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: AdminWithoutPassword })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Delete('agents/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  async deleteAgent(@Req() request: Request, @Param('id') id: string) {
    try {
      const response = await this.adminService.deleteAgent(id, request.id);
      this.logger.log(
        'Response status 200',
        `${AdminController.name}#deleteAgent`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#deleteAgent`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: AdminWithoutPassword })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Merchant, Role.Manager)
  @Get('admins/:id')
  async getAdmin(
    @Param('id') id: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminService.getAdminById(id, request.id);
      this.logger.log(
        'Response status 200',
        `${AdminController.name}#getAdmin`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#getAdmin`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @Patch('admins/:id')
  @UsePipes(new ValidationPipe())
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminService.updateAdminById(
        id,
        updateAdminDto,
        request.id,
      );
      const {
        id: adminId,
        userName,
        email,
        role,
        practiceManagement,
      } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.MANAGE_USERS,
        `${request.user.email} - ${role} Edited admin id ${id}`,
        {
          id: adminId,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          newAdminUserName: updateAdminDto.userName,
          newAdminEmail: updateAdminDto.email,
          newAdminPhoneNumber: updateAdminDto.phoneNumber,
          newAdminRole: updateAdminDto.role,
          newAdminPracticeManagement: updateAdminDto.practiceManagement,
        },
      );

      this.logger.log(
        'Response status 200',
        `${AdminController.name}#updateAdmin`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#updateAdmin`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
