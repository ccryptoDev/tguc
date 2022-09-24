import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { LoggerService } from '../../../logger/services/logger.service';

import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { UserDocumentsService } from '../services/documents.service';
import UploadDocDto from '../validation/uploadDoc.dto';
import { ScreenTrackingService } from '../../screen-tracking/services/screen-tracking.service';
import {
  AdminJwtPayload,
  UserJwtPayload,
} from '../../../authentication/types/jwt-payload.types';
import { Role } from '../../../authentication/roles/role.enum';
import { RolesGuard } from '../../../authentication/roles/guards/roles.guard';
import { Roles } from '../../../authentication/roles/roles.decorator';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../../admin/dashboard/log-activity/services/log-activity.service';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { ErrorResponse } from '../../../types/error-response';
import { UploadDocumentResponse } from '../types/upload-document-response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api')
export class DocumentsController {
  constructor(
    private readonly userDocumentsService: UserDocumentsService,
    private readonly logger: LoggerService,
    private readonly screenTrackingService: ScreenTrackingService,
    private readonly logActivityService: LogActivityService,
  ) {}

  @ApiCreatedResponse({ type: UploadDocumentResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('application/uploadDocument')
  @UseGuards(JwtAuthGuard)
  //@UsePipes(new ValidationPipe())
  async uploadDocument(
    @Body() uploadDocDto: UploadDocDto,
    @Req() request: Request & { user: UserJwtPayload & AdminJwtPayload },
  ) {
    uploadDocDto.userId = uploadDocDto.userId || request.user.id;
    try {
      const response = await this.userDocumentsService.uploadDocument(
        uploadDocDto,
        request.id,
        request.user,
      );
      this.logger.log(
        'Response status 201',
        `${DocumentsController.name}#uploadDocument`,
        request.id,
        response,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DocumentsController.name}#uploadDocument`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('admin/dashboard/users/documents/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserDocuments(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request,
  ) {
    try {
      const response = await this.userDocumentsService.getUserDocuments(
        screenTrackingId,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${DocumentsController.name}#getUserDocuments`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DocumentsController.name}#getUserDocuments`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiCreatedResponse({ type: UploadDocumentResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('admin/dashboard/users/documents')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  async uploadDocumentByAdmin(
    @Body() uploadDocDto: UploadDocDto,
    @Req() request: Request & { user: UserJwtPayload & AdminJwtPayload },
  ) {
    try {
      const screenTrackingId = uploadDocDto.screenTrackingId;
      const response = await this.userDocumentsService.uploadDocument(
        uploadDocDto,
        request.id,
        request.user,
        screenTrackingId,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.DOCUMENT_UPLOAD,
        `${request.user.email} - ${role} Uploaded document id ${response.documentId}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
          documentId: response.documentId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 201',
        `${DocumentsController.name}#uploadDocument`,
        request.id,
        response,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DocumentsController.name}#uploadDocument`,
        request.id,
        error,
      );
      throw error;
    }
  }
  @ApiCreatedResponse({ type: UploadDocumentResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Patch('admin/dashboard/users/updateDocumentStatus')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  async updateDocumentStatusByAdmin(
    @Body() body: { documentId: string, status: string, reason?: string | null},
    @Req() request: Request & { user: UserJwtPayload & AdminJwtPayload },
  ) {
    try {
      const response = await this.userDocumentsService.updateDocumentStatusByAdmin(
        body.documentId,
        body.status,
        body.reason || null,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${DocumentsController.name}#getUserDocuments`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DocumentsController.name}#getUserDocuments`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
