import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
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

import { ScreenTracking } from '../../../screen-tracking/entities/screen-tracking.entity';
import { JwtAuthGuard } from '../../../../authentication/strategies/jwt-auth.guard';
import { LoggerService } from '../../../../logger/services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestResponse } from '../../../../types/bad-request-response';
import { ErrorResponse } from '../../../../types/error-response';
import { SaveInstntDataDto } from "../validation/saveInstntData.dto";
import { InstntService } from "../services/instnt.service";
import { AdminJwtPayload } from '../../../../authentication/types/jwt-payload.types';
import { User } from '../../../../user/entities/user.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class InstntController {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    private readonly instntService: InstntService,
    private readonly logger: LoggerService,
  ) { }

  @Post('instnt')
  @UsePipes(new ValidationPipe())
  async saveInstntData(
    @Body() instntPayload: SaveInstntDataDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      // Return if already exists
      const instnt = await this.instntService.find(instntPayload, request.id);
      if (instnt) {
        return instnt;
      }

      const screenTracking = await this.screenTrackingModel.findOne({
        where: {
          id: instntPayload.screenTrackingId
        },
        relations: ['user']
      });
      const user = screenTracking?.user as User;
      instntPayload.userId = user?.id;
      instntPayload.screenTrackingId = screenTracking.id;
      const response = await this.instntService.saveInstntData(instntPayload, request.id);
      this.logger.log(
        'Response status 201',
        `${InstntController.name}#saveInstntData`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${InstntController.name}#saveInstntData`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
