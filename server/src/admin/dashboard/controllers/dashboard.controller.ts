import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
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
import moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminDashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { Role } from '../../../authentication/roles/role.enum';
import { Roles } from '../../../authentication/roles/roles.decorator';
import { RolesGuard } from '../../../authentication/roles/guards/roles.guard';
import { LoggerService } from '../../../logger/services/logger.service';
import { PaymentManagement } from '../../../loans/payments/payment-management/payment-management.entity';
import { ValidateObjectIdPipe } from '../pipes/validateObjectId.pipe';
import { UserService } from '../../../user/services/user.service';
import { AdminJwtPayload } from '../../../authentication/types/jwt-payload.types';
import { PaymentService } from '../../../loans/payments/services/payment.service';
import { MakePaymentDialogDto } from '../dtos/makePaymentDialog.dto';
import { MakePaymentDialogPipe } from '../pipes/makePaymentDialog.pipe';
import { LoanpaymentproService } from '../../../loans/payments/loanpaymentpro/loanpaymentpro.service';
import { SubmitPaymentDto } from '../dtos/submit-payment.dto';
import { ChangePaymentAmountDto } from '../dtos/change-payment-amount.dto';
import { LoanSettingsDto } from '../dtos/loan-settings.dto';
import { AddCardDto } from '../../../loans/payments/loanpaymentpro/validation/addCard.dto';
import { LoanPaymentProCardToken } from '../../../loans/payments/loanpaymentpro/loanpaymentpro-card-token.entity';
import { PracticeManagement } from '../practice-management/entities/practice-management.entity';
import { AppService } from '../../../app.service';
import { AddCardPipe } from '../../../loans/payments/loanpaymentpro/validation/addCard.pipe';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../log-activity/services/log-activity.service';
import { ConsentService } from '../../../user/consent/services/consent.service';
import { GenerateEFTADto } from '../../../loans/application/validation/generate-efta.dto';
import { LoanSettingsService } from '../../../loans/loan-settings/services/loan-settings.service';
import { GetAllUsersPipe } from '../validation/GetAllUsers.pipe';
import GetAllUsersDto from '../validation/GetAllUsers.dto';
import { BadRequestResponse } from '../../../types/bad-request-response';
import { ErrorResponse } from '../../../types/error-response';
import { GetAllUsersResponse } from '../types/get-all-users-response';
import { GetAllLoansResponse } from '../types/get-all-loans-response';
import { GetLoanCounters } from '../types/get-loan-countes-response';
import { GetApplicationInfoResponse } from '../types/get-application-info-response';
import { GetUserInfoResponse } from '../types/get-user-info-response';
import { UploadDocumentResponse } from 'src/user/documents/types/upload-document-response';
import { GetCreditReportResponse } from '../types/get-credit-report-response';
import { GetLPPCardsResponse } from '../types/get-lpp-cards-response';
import { PreviewPaymentResponse } from 'src/types/preview-payment-response';
import { SendGridService } from '../../../email/services/sendgrid.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { TwilioService } from '../../../sms/services/twilio.service';
import { ConfigService } from '@nestjs/config';
import Config from '../../../app.config';

@ApiBearerAuth()
@Controller('/api/admin/dashboard')
export class AdminDashboardController {
  constructor(
    @InjectRepository(PracticeManagement)
    private readonly PracticeManagementModel: Repository<PracticeManagement>,
    private readonly adminDashboardService: AdminDashboardService,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
    private readonly appService: AppService,
    private readonly consentService: ConsentService,
    private readonly loanSettingsService: LoanSettingsService,
    private readonly sendGridService: SendGridService,
    private readonly nunjucksService: NunjucksService,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
  ) { }

  @ApiOkResponse({ type: GetAllUsersResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('users')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsers(
    @Req() request: Request & { user: AdminJwtPayload },
    @Query(new GetAllUsersPipe()) getAllUsersDto: GetAllUsersDto,
  ) {
    try {
      const response = await this.adminDashboardService.getAllUsers(
        request.user,
        getAllUsersDto,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getAllUsers`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getAllUsers`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetAllLoansResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('loans')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getApplications(
    @Query('status')
    status: PaymentManagement['status'],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(25), ParseIntPipe) perPage: number,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const { role, practiceManagement, id } = request.user;
      const applications =
        await this.adminDashboardService.getApplicationByStatus(
          id,
          role,
          practiceManagement,
          status,
          page,
          perPage,
          search,
          request.id,
        );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplications`,
        request.id,
      );

      return applications;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplications`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetAllLoansResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('contractors')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getContractorApplications(
    @Query('status')
    status: PaymentManagement['status'],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(25), ParseIntPipe) perPage: number,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const { role, practiceManagement } = request.user;
      const applications =
        await this.adminDashboardService.getContractorApplicationByStatus(
          role,
          practiceManagement,
          status,
          page,
          perPage,
          search,
          request.id,
        );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplications`,
        request.id,
      );

      return applications;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplications`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetLoanCounters })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('loans/counters')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLoanCounters(@Req() request: Request & { user: AdminJwtPayload }) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getLoanCounters`,
      request.id,
    );

    try {
      const { role, practiceManagement } = request.user;
      const stats = await this.adminDashboardService.getLoanCounters(
        role,
        practiceManagement,
        request.id,
      );
      this.logger.log(
        'Return data:',
        `${AdminDashboardController.name}#getLoanCounters`,
        request.id,
        stats,
      );

      return stats;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getLoanCounters`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetApplicationInfoResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('application/info/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getApplicationInfo(
    @Req() request: Request & { user: AdminJwtPayload },
    @Param('screenTrackingId') screenTrackingId: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getApplicationInfo`,
      request.id,
    );

    try {
      const response = await this.adminDashboardService.getApplicationInfo(
        screenTrackingId,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.LOAN_DETAILS,
        `${request.user.email} - ${role} Viewing loan details`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        // response.financingReferenceNumber,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetApplicationInfoResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('application/contractor/approve/:email')
  @Roles(
    Role.SuperAdmin,
    Role.Manager,
    Role.MerchantStaff,
    Role.Merchant,
    Role.User,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  async approveContractorApplication(
    @Req() request: Request & { user: AdminJwtPayload },
    @Param('email') contractorEmail: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getApplicationInfo`,
      request.id,
    );

    try {
      const approvedContractor =
        await this.adminDashboardService.approveContractor(
          contractorEmail,
          request.id,
        );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
      );

      return approvedContractor;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetApplicationInfoResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('application/contractor/deny/:email')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async denyContractorApplication(
    @Req() request: Request & { user: AdminJwtPayload },
    @Param('email') contractorEmail: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getApplicationInfo`,
      request.id,
    );

    try {
      const approvedContractor =
        await this.adminDashboardService.denyContractor(
          contractorEmail,
          request.id,
        );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
      );

      return approvedContractor;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetApplicationInfoResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('application/contractor/update/:email/:status')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateApplicationState(
    @Req() request: Request & { user: AdminJwtPayload },
    @Param('email') contractorEmail: string,
    @Param('status') status: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#updateApplicationState`,
      request.id,
    );

    try {
      const updatedContractor =
        await this.adminDashboardService.updateApplicationState(
          contractorEmail,
          request.id,
          status,
        );
      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#updateApplicationState`,
        request.id,
      );
      return updatedContractor;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updateApplicationState`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetUserInfoResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('users/:userId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserInfo(
    @Req() request: Request,
    @Param('userId', ValidateObjectIdPipe) userId: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getUserInfo`,
      request.id,
      userId,
    );

    try {
      const info = await this.userService.getInfo(userId, request.id);
      this.logger.log(
        'Return user info: ',
        `${AdminDashboardController.name}#getUserInfo`,
        request.id,
        info,
      );

      return info;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getUserInfo`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: UploadDocumentResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('resignEFTA/:screenTrackingId/:cardToken')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getResignEFTA(
    @Req() request: Request,
    @Param('screenTrackingId', ValidateObjectIdPipe) screenTrackingId: string,
    @Param('cardToken') cardToken: string,
  ) {
    try {
      const response = await this.consentService.resignEFTA(
        screenTrackingId,
        cardToken,
        request,
      );

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#resignEFTA`,
        request.id,
      );

      return { documentId: response };
    } catch (error) {
      this.logger.error(
        'Error',
        `${AdminDashboardController.name}#resignEFTA`,
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
  @Post('efta/')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async generateEFTA(
    @Body() generateEFTADto: GenerateEFTADto,
    @Req() request: Request,
  ) {
    const id = generateEFTADto.userId
      ? generateEFTADto.userId
      : request.user.id;
    try {
      const response = await this.consentService.createEFTAAgreement(
        id,
        generateEFTADto,
        request,
      );

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#generateEFTA`,
        request.id,
      );

      return { documentId: response };
    } catch (error) {
      this.logger.error(
        'Error',
        `${AdminDashboardController.name}#generateEFTA`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: GetCreditReportResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('creditReport/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCreditReport(
    @Req() request: Request,
    @Param('screenTrackingId', ValidateObjectIdPipe) screenTrackingId: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getCreditReport`,
      request.id,
      screenTrackingId,
    );

    try {
      const info = await this.adminDashboardService.getCreditReport(
        screenTrackingId,
        request.id,
      );
      this.logger.log(
        'Return user info: ',
        `${AdminDashboardController.name}#getCreditReport`,
        request.id,
        info,
      );

      return info;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getCreditReport`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('loans/paymentSchedule/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPaymentSchedule(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request,
  ) {
    try {
      const response = await this.adminDashboardService.getPaymentSchedule(
        screenTrackingId,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getPaymentSchedule`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getPaymentSchedule`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('inviteBorrower/:email')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async inviteBorrowerByEmail(
    @Param('email') email: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const practiceManagement = await this.PracticeManagementModel.findOne({
        id: request?.user?.practiceManagement
      });
      const context = {
        link: `https://tguc.alchemylms.com/application/apply-borrower/?ref=${request?.user?.id}`,
        contractorBusinessName: practiceManagement?.practiceName,
        baseUrl: Config().baseUrl,
      };
      const html: string = await this.nunjucksService.htmlToString(
        'emails/application-link.html',
        context,
      );
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        email,
        'TGUC Financial Application',
        html,
        request.id,
      );

      const response = {
        success: 'yessss',
      };

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('inviteBorrowerPhone/:phone')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async inviteBorrowerByPhone(
    @Param('phone') phone: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const applicationLinkUrl =
        `https://tguc.alchemylms.com/application/apply-borrower/?ref=${request?.user?.id}`;
      const smsMessage = this.configService.get<string>('smsTemplate');
      await this.twilioService.sendTextMessage(
        phone,
        `${smsMessage} ${applicationLinkUrl}`,
        request.id,
      );

      const response = {
        success: 'yessss',
      };

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('users/cards/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addLoanPaymentProCard(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new AddCardPipe()) addCardDto: AddCardDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    addCardDto.screenTrackingId = screenTrackingId;

    try {
      const response: LoanPaymentProCardToken =
        await this.loanPaymentProService.v2PaymentCardsAdd(
          addCardDto,
          request.id,
        );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.ACCOUNTS,
        `${request.user.email} - ${role} Added card id ${response.id}. Card last four digits ${response.cardNumberLastFour}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
          userId: response.user,
          cardId: response.id,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Patch('users/cards/:paymentMethodToken')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateLoanPaymentProCard(
    @Param('paymentMethodToken') paymentMethodToken: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      await this.loanPaymentProService.updateCard(
        paymentMethodToken,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updateLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: [GetLPPCardsResponse] })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('users/cards/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLoanPaymentProCards(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.loanPaymentProService.getUserCards(
        screenTrackingId,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getLoanPaymentProCards`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getLoanPaymentProCards`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiOkResponse({ type: PreviewPaymentResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('loans/previewPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async previewPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Query(new MakePaymentDialogPipe()) makePaymentDto: MakePaymentDialogDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      makePaymentDto.screenTracking = screenTrackingId;
      const response = await this.paymentService.makePaymentRenderDialog(
        makePaymentDto,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#previewPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#previewPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('loans/submitPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async submitPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new MakePaymentDialogPipe()) submitPaymentDto: SubmitPaymentDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    submitPaymentDto.screenTracking = screenTrackingId;
    try {
      const response = await this.paymentService.submitPayment(
        submitPaymentDto,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      if (response) {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Made payment with amount ${response.amount}. Payment reference ${response.paymentReference}. Payment id ${response.id}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
            paymentId: response.id,
            paymentManagementId: response.paymentManagement as string,
            paymentStatus: response.status,
            customerPracticeManagementId: response.practiceManagement as string,
          },
          undefined,
          response.paymentManagement as string,
          screenTrackingId,
        );
      } else {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Scheduled payment for ${moment(
            submitPaymentDto.paymentDate,
          ).format('MM/DD/YYYY')} with amount ${submitPaymentDto.amount}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
          },
          undefined,
          undefined,
          screenTrackingId,
        );
      }

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#submitPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#submitPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/amendPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async amendPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new MakePaymentDialogPipe()) submitPaymentDto: SubmitPaymentDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    submitPaymentDto.screenTracking = screenTrackingId;
    try {
      const response = await this.paymentService.amendPayment(
        submitPaymentDto,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      if (response) {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Made Amendpayment with amount ${response.amount}. Payment reference ${response.paymentReference}. Payment id ${response.id}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
            paymentId: response.id,
            paymentManagementId: response.paymentManagement as string,
            paymentStatus: response.status,
            customerPracticeManagementId: response.practiceManagement as string,
          },
          undefined,
          response.paymentManagement as string,
          screenTrackingId,
        );
      } else {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Scheduled payment for ${moment(
            submitPaymentDto.paymentDate,
          ).format('MM/DD/YYYY')} with amount ${submitPaymentDto.amount}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
          },
          undefined,
          undefined,
          screenTrackingId,
        );
      }

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#submitPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#submitPayment`,
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
  @Patch('loans/changePaymentAmount/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePaymentAmount(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new ValidationPipe()) changePaymentAmountDto: ChangePaymentAmountDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    changePaymentAmountDto.screenTracking = screenTrackingId;

    try {
      await this.adminDashboardService.changeMonthlyPaymentAmount(
        changePaymentAmountDto,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Changed current payment amount to ${changePaymentAmountDto.amount}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Patch('loans/toggleAutopay/:paymentManagementId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async toggleAutopay(
    @Param('paymentManagementId') paymentManagementId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      await this.paymentService.triggerAutoPay(paymentManagementId);
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updateLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('loans/settings')
  @Roles(Role.SuperAdmin, Role.Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLoanSettings(@Req() request: Request & { user: AdminJwtPayload }) {
    try {
      const loanSettings = await this.loanSettingsService.getLoanSettings();

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getLoanSettings`,
        request.id,
      );
      return loanSettings;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getLoanSettings`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Patch('loans/settings')
  @Roles(Role.SuperAdmin, Role.Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateLoanSettings(
    @Body(new ValidationPipe()) loanSettingsDto: LoanSettingsDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const originalLoanSettings =
        await this.loanSettingsService.getLoanSettings();
      await this.loanSettingsService.updateLateFee(loanSettingsDto.lateFee);
      await this.loanSettingsService.updateNSFFee(loanSettingsDto.nsfFee);
      await this.loanSettingsService.updateLateFeeGracePeriod(
        loanSettingsDto.lateFeeGracePeriod,
      );
      const loanSettings =
        await this.loanSettingsService.updateDelinquencyPeriod(
          loanSettingsDto.delinquencyPeriod,
        );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.LOAN_SETTINGS,
        `${request.user.email} - ${role} 
          Updated loan settings from 
          Late Fee: $${originalLoanSettings.lateFee} -> $${loanSettings.lateFee},
          NSF Fee: $${originalLoanSettings.nsfFee} -> $${loanSettings.nsfFee},
          Late Fee Grace Period: ${originalLoanSettings.lateFeeGracePeriod} days -> ${loanSettings.lateFeeGracePeriod} days,
          Delinquency Period: ${originalLoanSettings.delinquencyPeriod} days -> ${loanSettings.delinquencyPeriod} days
        `,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          undefined,
        },
        undefined,
        undefined,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#updateLoanSettings`,
        request.id,
      );
      return loanSettings;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updateLoanSettings`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Post('loans/forgivePayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async forgivePayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      await this.adminDashboardService.forgivePayment(
        screenTrackingId,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${AdminDashboardController.name}#forgivePayment`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#forgivePayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('loans/forgiveLatefee/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async forgiveLateFee(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminDashboardService.forgiveLatefee(
        screenTrackingId,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Forgive late fees for user.`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );
      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiCreatedResponse({ type: PaymentManagement })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('loans/deferPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deferPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminDashboardService.deferPayment(
        screenTrackingId,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Defered next available payment.`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );
      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('onboarding/:id/:email')
  async sendOnboardEmail(
    @Param('email') email: string,
    @Param('id') id: string,
    @Req() request: Request
  ) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return {
          error: `User with email: ${email} not found`
        };
      }
      const practiceManagement = user?.practiceManagement as PracticeManagement;
      const context = {
        name: `${user.firstName} ${user.lastName}`,
        businessName: practiceManagement?.practiceName,
        baseUrl: Config().baseUrl,
      };
      let htmlTemplate = '';
      let subject = '';
      switch (id) {
        case '1':
          htmlTemplate = 'emails/onboard.html';
          subject = 'Let\'s get you set-up with TGUC Financial';
          break;
        case '2':
          htmlTemplate = 'emails/onboard-2.html';
          subject = 'It\'s time to set up your portal with TGUC Financial';
          break;
      }
      const html: string = await this.nunjucksService.htmlToString(
        htmlTemplate,
        context,
      );
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        email,
        subject,
        html,
        request.id,
      );

      const response = {
        success: `'Onboard Email ${id} Sent'`,
      };

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#sendOnboardEmail`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#sendOnboardEmail`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('reengagement/:id/:email')
  async sendReengagementEmail(
    @Param('email') email: string,
    @Param('id') id: string,
    @Req() request: Request
  ) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return {
          error: `User with email: ${email} not found`
        };
      }
      const practiceManagement = user?.practiceManagement as PracticeManagement;
      const context = {
        firstName: user?.firstName,
        businessName: practiceManagement?.practiceName,
        baseUrl: Config().baseUrl,
      };
      let htmlTemplate = '';
      let subject = '';
      switch (id) {
        case '1':
          htmlTemplate = 'emails/reengagement.html';
          subject = 'Please set up your lending platform with TGUC Financial';
          break;
        case '2':
          htmlTemplate = 'emails/reengagement-2.html';
          subject = 'Time to roll with TGUC Financial!';
          break;
        case '3':
          htmlTemplate = 'emails/reengagement-3.html';
          subject = 'Finance your homeowner’s today! Don’t let one more day pass you by';
          break;
      }
      const html: string = await this.nunjucksService.htmlToString(
        htmlTemplate,
        context,
      );
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        email,
        subject,
        html,
        request.id,
      );
      const response = {
        success: `'Reengament Email ${id} Sent'`,
      };

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#sendReengagementEmail`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#sendOnboardEmail`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('activation/:id/:email')
  async sendActivationEmail(
    @Param('email') email: string,
    @Param('id') id: string,
    @Req() request: Request
  ) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return {
          error: `User with email: ${email} not found`
        };
      }
      const practiceManagement = user?.practiceManagement as PracticeManagement;
      const context = {
        firstName: user?.firstName,
        businessName: practiceManagement?.practiceName,
        baseUrl: Config().baseUrl,
      };
      let htmlTemplate = '';
      let subject = '';
      switch (id) {
        case '1':
          htmlTemplate = 'emails/activation.html';
          subject = 'Let\'s finish your TGUC Financial application!';
          break;
        case '2':
          htmlTemplate = 'emails/activation-2.html';
          subject = 'You are almost there! Let us help you complete your application with TGUC Financial!';
          break;
        case '3':
          htmlTemplate = 'emails/activation-3.html';
          subject = 'Let\'s get it started with TGUC Financial today!';
          break;
      }
      const html: string = await this.nunjucksService.htmlToString(
        htmlTemplate,
        context,
      );
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        email,
        subject,
        html,
        request.id,
      );
      const response = {
        success: `'Activation Email ${id} Sent'`,
      };

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#sendActivationEmail`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#sendActivationEmail`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('pendingEmail/:id/:email')
  async sendPendingEmail(
    @Param('email') email: string,
    @Param('id') id: string,
    @Req() request: Request
  ) {
    try {
      const context = {
        firstName: 'Temeka',
        baseUrl: Config().baseUrl
      };
      let htmlTemplate: string = '';
      switch (id) {
        case 'contractor':
          htmlTemplate = 'emails/application-pending.html'
          break;
        case 'borrower':
          htmlTemplate = 'emails/application-pending-borrower.html'
          break;
        default:
          break;
      }
      if (htmlTemplate === '') {
        return {error: "missing Id"};
      }
      const html: string = await this.nunjucksService.htmlToString(
        htmlTemplate,
        context,
      );
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        email,
        'TGUC Financial Application',
        html,
        request.id,
      );

      const response = {
        success: `'Pending Email ${id} Sent'`,
      };

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#sendPendingEmail`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#sendPendingEmail`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(201)
  @Patch('loans/workcompletion/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.MerchantStaff, Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async setWorkCompletion(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body() body: { status: boolean},
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    const { status } = body;
    try {
      const response = await this.adminDashboardService.setWorkCompletion(
        screenTrackingId,
        request.id,
        status
      );
      this.logger.log(
        'Response status 204',
        `${AdminDashboardController.name}#setWorkCompletion`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#setWorkCompletion`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
