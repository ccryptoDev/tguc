import {
  Body,
  Param,
  Controller,
  Get,
  HttpCode,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { LoggerService } from '../../logger/services/logger.service';
import { JwtAuthGuard } from '../../authentication/strategies/jwt-auth.guard';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { UserService } from '../services/user.service';
import { BadRequestResponse } from '../../types/bad-request-response';
import { ErrorResponse } from '../../types/error-response';
import { GetUserResponse } from '../types/get-user-response';
import { UpdatePasswordAndPhonesDto, SetZipcodeAndRadiusDto } from '../validation/update-user-data.dto';

@Controller('/api/application')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @ApiBearerAuth()
  @ApiOkResponse({ type: GetUserResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getApplicationInformation(@Req() request: Request) {
    const screenTracking: string = request.user.screenTracking;
    try {
      const response = await this.userService.getApplicationInformation(
        screenTracking,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${UserController.name}#getApplicationInformation`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#getApplicationInformation`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Patch('user')
  async updatePasswordAndPhones(
    @Body() updateUserDataDto: UpdatePasswordAndPhonesDto,
    @Req() request: Request,
  ) {
    const userId: string = request.user.id;
    try {
      const response = await this.userService.updatePasswordAndPhones(
        userId,
        updateUserDataDto,
        request.id,
      );

      this.logger.log(
        'Response status 204',
        `${UserController.name}#updatePasswordAndPhoneNumbers`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#updatePasswordAndPhoneNumbers`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: GetUserResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get('id-by-token/:token')
  async getIdByToken(@Param('token') token: string, @Req() request: Request) {
    const payload = this.authenticationService.decodeToken(token) || {};
    const id = payload.id || payload._id;
    try {
      const response = await this.userService.getIdByToken(id, request.id);

      this.logger.log(
        'Response status 200',
        `${UserController.name}#getIdByToken`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#getIdByToken`,
        request.id,
        error,
      );
      throw error;
    }
  }


  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Patch('zipcode')
  async setZipcodeAndRadius(
    @Body() setZipcodeAndRadius: SetZipcodeAndRadiusDto,
    @Req() request: Request,
  ) {
    const userId: string = setZipcodeAndRadius.userId;
    try {
      const response = await this.userService.setZipcodeAndRadius(
        userId,
        setZipcodeAndRadius,
        request.id,
      );

      this.logger.log(
        'Response status 204',
        `${UserController.name}#updatePasswordAndPhoneNumbers`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#updatePasswordAndPhoneNumbers`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: GetUserResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('zipcodes/:id')
  async getZipcode(@Param('id') id: string, @Req() request: Request) {
    try {
      const adminId: string = id;
      const response = await this.userService.getZipcodes(adminId, request.id);
      this.logger.log(
        'Response status 200',
        `${UserController.name}#getZipcode`,
        request.id,
      );
      return response.zipcodeAndRadius;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#getZipcode`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Patch('user/rules')
  async updateUserRules(
    @Body() body : any,
    @Req() request: Request,
  ) {
    const adminId: string = request.user.id;
    try {
      const response = await this.userService.updateUserRules(
        body,
        adminId,
        request.id,
      );

      this.logger.log(
        'Response status 204',
        `${UserController.name}#updateUserRules ` + response,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#updateUserRules`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Patch('user/setworkcompletion')
  async userSetWorkCompletion(
    @Req() request: Request,
  ) {
    const userId: string = request.user.id;
    try {
      const response = await this.userService.userApproveWorkCompletion(
        userId,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${UserController.name}#userSetWorkCompletion ` + response,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#userSetWorkCompletion`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Patch('user/deniedworkcompletion')
  async userDeniedWorkCompletion(
    @Req() request: Request,
  ) {
    const userId: string = request.user.id;
    try {
      const response = await this.userService.userDeniedWorkCompletion(
        userId,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${UserController.name}#userDeniedWorkCompletion ` + response,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#userDeniedWorkCompletion`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
