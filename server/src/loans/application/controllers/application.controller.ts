import {
  Controller,
  Post,
  Body,
  Req,
  Patch,
  UsePipes,
  UseGuards,
  ValidationPipe,
  Get,
  HttpCode,
  Put,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { User } from '../../../user/entities/user.entity';
import { ApplyDto, UpdatedApplyDto } from '../validation/apply.dto';
import { ContractorApplyDto } from '../validation/contractorApply.dto';
import { CardsDto } from '../validation/cards.dto';
import { ApplyPipe } from '../validation/apply.pipe';
import { AdminService } from '../../../admin/services/admin.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { UserService } from '../../../user/services/user.service';
import { CountersService } from '../../../counters/services/counters.service';
import { LoanpaymentproService } from '../../payments/loanpaymentpro/loanpaymentpro.service';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { ApplicationService } from '../services/application.service';
import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { ConsentService } from '../../../user/consent/services/consent.service';
import { GenerateEFTADto } from '../validation/generate-efta.dto';
import { ApplyResponse } from '../types/applyResponse';
import { BadRequestResponse } from 'src/types/bad-request-response';
import { ErrorResponse } from 'src/types/error-response';
import { GetContractResponse } from '../types/get-contract-response';
import { PaymentManagementService } from '../../payments/payment-management/payment-management.service';
import { SendGridService } from '../../../email/services/sendgrid.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import Config from '../../../app.config';
import { RolesGuard } from '../../../authentication/roles/guards/roles.guard';
import { Roles } from '../../../authentication/roles/roles.decorator';
import { Role } from '../../../authentication/roles/role.enum';
import { DenyDto } from '../validation/deny.dto';
import { ConfigService } from '@nestjs/config';
import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { ExperianService } from '../../../user/underwriting/experian/services/experian.service';
@Controller('/api/application')
export class ApplicationController {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly adminService: AdminService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly countersService: CountersService,
    private readonly applicationService: ApplicationService,
    private readonly consentService: ConsentService,
    private readonly sendGridService: SendGridService,
    private readonly nunjucksService: NunjucksService,
    private readonly configService: ConfigService,
    private readonly experianService: ExperianService,
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
  ) {}

  @ApiCreatedResponse({ type: ApplyResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('contractor/apply')
  async contractorApply(
    @Body(new ApplyPipe()) applyDto: ContractorApplyDto,
    @Req() request: Request,
  ) {
    this.logger.log(
      'Request params:',
      `${ApplicationController.name}#apply`,
      request.id,
      applyDto,
    );

    try {
      if (applyDto.ssnNumber != '666603693') {
        await this.userService.ssnValidatenext(
          applyDto.ssnNumber,
          request.id,
          'Apply',
        );
      }

      const user: User = await this.userService.createNewUser(
        applyDto,
        request.id,
      );

      if (!user.screenTracking) {
        const applicationReferenceData =
          await this.countersService.getNextSequenceValue(
            'contractor',
            request.id,
          );
        const newScreenTracking = {
          user: user.id,
          applicationReference: `CTR_${applicationReferenceData.sequenceValue}`,
          lastLevel: 'apply' as
            | 'apply'
            | 'offers'
            | 'denied'
            | 'sign-contract'
            | 'repayment'
            | 'document-upload',
          lastScreen: 'address-information' as
            | 'address-information'
            | 'connect-bank'
            | 'waiting-for-approve'
            | 'select-offer'
            | 'payment-details'
            | 'sign-contract'
            | 'social-security-number'
            | 'thank-you',
          practiceManagement: user.practiceManagement,
          isCompleted: false,
          // incomeAmount: Math.trunc(
          //   parseFloat(`${applyDto.annualIncome}`.replace(/[^0-9.]/g, '')),
          // ),
          source: applyDto.source,
          isContractor: true,
          // requestedAmount: applyDto.requestedAmount,
          // isBackendApplication: applyDto.isBackendApplication ? true : false,
        };
        this.logger.log(
          'Creating new screen tracking with params:',
          `${ApplicationController.name}#apply`,
          request.id,
          newScreenTracking,
        );
        let screenTracking: ScreenTracking =
          await this.screenTrackingModel.create(newScreenTracking);
        screenTracking = await this.screenTrackingModel.save(screenTracking);
        user.screenTracking = screenTracking.id;
        await this.userModel.save(user);

        await this.applicationService.underwriteContractor(
          screenTracking,
          user,
          request.id,
        );

        this.logger.log(
          'Response status 201',
          `${ApplicationController.name}#apply`,
          request.id,
          { userId: user.id, screenTrackingId: screenTracking.id },
        );
      }

      return {
        userId: user.id,
        screenTrackingId: user.screenTracking,
        referenceNumber: user.userReference,
      };
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#apply`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiCreatedResponse({ type: ApplyResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('apply')
  async apply(
    @Body(new ApplyPipe()) applyDto: ApplyDto,
    @Req() request: Request,
  ) {
    this.logger.log(
      'Request params:',
      `${ApplicationController.name}#apply`,
      request.id,
      applyDto,
    );

    try {
      if (applyDto.ssnNumber != '666603693') {
        await this.userService.ssnValidatenext(
          applyDto.ssnNumber,
          request.id,
          'Apply',
        );
      }
      if (applyDto.referredBy) {
        const referrer = await this.adminService.getAdminById(
          applyDto.referredBy,
          request.id,
        );
        const pm = referrer?.practiceManagement as PracticeManagement;
        applyDto.practiceManagement = pm?.id;
      }
      const user: User = await this.userService.createNewUser(
        applyDto,
        request.id,
      );

      if (!user.screenTracking) {
        const applicationReferenceData =
          await this.countersService.getNextSequenceValue(
            'application',
            request.id,
          );
        const newScreenTracking = {
          user: user.id,
          applicationReference: `APL_${applicationReferenceData.sequenceValue}`,
          lastLevel: 'apply' as
            | 'apply'
            | 'offers'
            | 'denied'
            | 'sign-contract'
            | 'repayment'
            | 'document-upload',
          practiceManagement: user.practiceManagement,
          isCompleted: false,
          // incomeAmount: Math.trunc(
          //   parseFloat(`${applyDto.annualIncome}`.replace(/[^0-9.]/g, '')),
          // ),
          source: applyDto.source,
          // requestedAmount: applyDto.requestedAmount,
          // isBackendApplication: applyDto.isBackendApplication ? true : false,
        };
        this.logger.log(
          'Creating new screen tracking with params:',
          `${ApplicationController.name}#apply`,
          request.id,
          newScreenTracking,
        );
        let screenTracking: ScreenTracking =
          this.screenTrackingModel.create(newScreenTracking);
        screenTracking = await this.screenTrackingModel.save(screenTracking);
        user.screenTracking = screenTracking.id;
        const createdUser = await this.userModel.save(user);


        // const paymentManagement =
        //   await this.paymentManagementService.createPaymentManagement(
        //     screenTracking,
        //     'approved',
        //     '1',
        //   );
        // const html: string = await this.nunjucksService.htmlToString(
        //   'emails/application-approved-borrower.html',
        //   {
        //     name: `${applyDto.firstName} ${applyDto.lastName}`,
        //     amount: paymentManagement?.principalAmount,
        //     baseUrl: Config().baseUrl,
        //   },
        // );
        // const applicationNumber = createdUser?.userReference.replace(
        //   'USR_',
        //   '',
        // );
        // const fromName = this.configService.get<string>('sendGridFromName');
        // const fromEmail = this.configService.get<string>('sendGridFromEmail');
        // await this.sendGridService.sendEmail(
        //   `${fromName} <${fromEmail}>`,
        //   createdUser?.email,
        //   `Congratulations! TGUC credit application #${applicationNumber} is approved!`,
        //   html,
        //   request.id,
        // );

        this.logger.log(
          'Response status 201',
          `${ApplicationController.name}#apply`,
          request.id,
          { userId: user.id, screenTrackingId: screenTracking.id },
        );
      }

      return {
        userId: user.id,
        screenTrackingId: user.screenTracking,
        referenceNumber: user.userReference,
      };
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#apply`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager)
  @Put('deny/:screenTrackingId')
  async denyBorrowerApplication(
    @Body() denyApplicationDto: DenyDto,
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
  ) {
    return await this.paymentManagementService.denyApplication(
      screenTrackingId,
      denyApplicationDto,
      request.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Manager)
  @Put('approve/:screenTrackingId')
  async approveBorrowerApplication(
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
  ) {
    return await this.paymentManagementService.approveApplication(
      screenTrackingId,
      request.id,
    );
  }

  @ApiCreatedResponse({ type: ApplyResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Put('updateApply')
  async updateApply(
    @Body() updatedApplyDto: UpdatedApplyDto,
    @Req() request: Request,
  ) {
    try {
      const user = await this.userService.updateUser(
        updatedApplyDto,
        request.id,
      );
      const application: any = await this.screenTrackingModel.findOne({
        where: {
          user: updatedApplyDto.userId,
        },
        relations: ['user', 'user.referredBy', 'practiceManagement'],
      });

      await this.screenTrackingModel.update(application.id, {
        lastScreen: 'connect-bank',
      });
      const applyBorrowerRules = await this.applicationService.underwriteBorrower(
        application,
        application.user,
        request.id,
      );

      let score = 0;
      let isApproved = applyBorrowerRules.loanApproved;
      let isPending = applyBorrowerRules.isPending;
      try {
        score = parseInt(applyBorrowerRules.creditScore);
        if (score > 651 && isApproved) {
          if (isPending) {
            await this.screenTrackingModel.update(application.id, {
              lastScreen: 'waiting-for-approve',
            });
          } else if (!isPending) {
            await this.screenTrackingModel.update(application.id, {
              lastScreen: 'select-offer',
            });
          }
        } else if (score >= 600 && score < 650 && isApproved) {
          await this.screenTrackingModel.update(application.id, {
            lastScreen: 'connect-bank',
          });
        }
      } catch (e) {

      }
      let offersData = applyBorrowerRules.offersData;
      let defaultTerms = applyBorrowerRules.defaultOfferTerm;
      return {user, score, isApproved, offersData, defaultTerms};
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#updateApply`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @ApiBearerAuth()
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('consents')
  async createConsents(@Req() request: Request) {
    const { screenTracking } = request.user;
    try {
      await this.consentService.createConsents(screenTracking, request);

      this.logger.log(
        'Response status 204',
        `${ApplicationController.name}#createConsents`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#createConsents`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @ApiBearerAuth()
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('finalize')
  @UsePipes(new ValidationPipe())
  async finalize(@Req() request: Request) {
    const { screenTracking, id } = request.user;
    try {
      await this.applicationService.createLoan(screenTracking, id, request.id);
      await this.applicationService.generateRIC(screenTracking, id, request);
      await this.applicationService.connectUserConsentsToPM(
        screenTracking,
        id,
        request.id,
      );

      this.logger.log(
        'Response status 201',
        `${ApplicationController.name}#finalize`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#finalize`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: GetContractResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @Get('contract')
  @UsePipes(new ValidationPipe())
  async getContractData(@Req() request: Request) {
    const screenTrackingId = request.user.screenTracking;

    try {
      const response = await this.applicationService.getPromissoryNoteData2(
        screenTrackingId,
        request,
      );
      this.logger.log(
        'Response status 200',
        `${ApplicationController.name}#getContractData`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#getContractData`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('efta')
  @UsePipes(new ValidationPipe())
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
        `${ApplicationController.name}#generateEFTA`,
        request.id,
      );

      return { documentId: response };
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#generateEFTA`,
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('user/cards')
  @UsePipes(new ValidationPipe())
  async updateLoanPaymentProCard(
    @Body() cardsDto: CardsDto,
    @Req() request: Request,
  ) {
    try {
      const paymentMethodToken = cardsDto.paymentMethodToken;
      await this.loanPaymentProService.updateCard(
        paymentMethodToken,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#updateLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: GetContractResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @Post('updateApplicationLastStep')
  @UsePipes(new ValidationPipe())
  async updateContractorApplicationLastStep(
    @Body() body: any,
    @Req() request: Request,
  ) {
    const { lastLevel } = body;
    const screenTrackingId =
      body.screenTrackingId || request.user.screenTracking;

    try {
      const response =
        await this.applicationService.updateContractorApplicationLastStep(
          screenTrackingId,
          lastLevel,
          request.id,
        );
      this.logger.log(
        'Response status 200',
        `${ApplicationController.name}#updateContractorApplicationLastStep`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#updateContractorApplicationLastStep`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiCreatedResponse({ type: ApplyResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('changeUserLastScreen')
  async changeUserLastScreen(
    @Body() application: any,
    @Req() request: Request,
  ) {
    try {
      const applicationData =
        await this.userService.getApplicationInformationByUserId(
          application.userId,
          request.id,
        );

      await this.screenTrackingModel.update(applicationData.id, {
        lastScreen: application.lastScreen,
      });
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#changeUserLastScreen`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiCreatedResponse({ type: ApplyResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('changeContractorLastScreen')
  async changeContractorLastScreen(
    @Body() application: any,
    @Req() request: Request,
  ) {
    try {
      await this.screenTrackingModel.update(application.screenId, {
        lastScreen: application.lastScreen,
      });
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#changeUserLastScreen`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiCreatedResponse({ type: ApplyResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('sendNewApplicationEmail')
  async sendNewApplicationEmail(
    @Body() userId: string,
    @Req() request: Request,
  ) {
    try {
      //Convert the application id to string
      const convertedApplicationId = Object.keys(userId)[0];

      //Get the application data
      const applicationData =
        await this.userService.getApplicationInformationByUserId(
          convertedApplicationId,
          request.id,
        );

      await this.screenTrackingModel.update(applicationData.id, {
        lastScreen: 'select-offer',
      });

      //Get the user information
      const user = await this.userService.getInfo(
        convertedApplicationId,
        request.id,
      );

      const context = {
        firstName: user.firstName,
        baseUrl: Config().baseUrl,
      };

      const html: string = await this.nunjucksService.htmlToString(
        'emails/new-application-email-borrower.html',
        context,
      );

      //Send the email
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        user.email,
        `TGUC Credit Application #${applicationData.applicationReference}`,
        html,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#sendNewApplicationEmail`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiCreatedResponse({ type: ApplyResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Post('sendCompletedApplicationEmail')
  async sendCompletedApplicationEmail(
    @Body() userId: any,
    @Req() request: Request,
  ) {
    try {
      //Convert the application id to string
      const convertedApplicationId = Object.keys(userId)[0];

      //Get the application data
      const applicationData =
        await this.userService.getApplicationInformationByUserId(
          convertedApplicationId,
          request.id,
        );

      //Get the user information
      const user = await this.userService.getInfo(
        convertedApplicationId,
        request.id,
      );

      const context = {
        firstName: user.firstName,
        baseUrl: Config().baseUrl,
      };

      const html: string = await this.nunjucksService.htmlToString(
        'emails/application-completed-borrower.html',
        context,
      );

      //Send the email
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        user.email,
        `TGUC Loan application #${applicationData.applicationReference} is being reviewed`,
        html,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#sendNewApplicationEmail`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: GetContractResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @Patch('updateBusinessData')
  @UsePipes(new ValidationPipe())
  async updateBusinessData(@Body() body: any, @Req() request: Request) {
    const screenTrackingId =
      body.screenTrackingId || request.user.screenTracking;
    try {
      const response = await this.applicationService.updateBusinessData(
        screenTrackingId,
        body,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${ApplicationController.name}#updateBusinessData`,
        request.id,
        response,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#updateBusinessData`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: GetContractResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @Get('practiceManagement/:screenTrackingId')
  @UsePipes(new ValidationPipe())
  async getPracticeManagementByScreenTrackingId(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request,
  ) {
    try {
      const response =
        await this.applicationService.getPracticeManagementByScreenTrackingId(
          screenTrackingId,
          request.id,
        );
      this.logger.log(
        'Response status 200',
        `${ApplicationController.name}#getPracticeManagementByScreenTrackingId`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#getPracticeManagementByScreenTrackingId`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
