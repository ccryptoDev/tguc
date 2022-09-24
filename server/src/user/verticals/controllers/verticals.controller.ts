import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AdminJwtPayload } from '../../../authentication/types/jwt-payload.types';
import { RolesGuard } from '../../../authentication/roles/guards/roles.guard';
import { Role } from '../../../authentication/roles/role.enum';
import { Roles } from '../../../authentication/roles/roles.decorator';
import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { VerticalsService } from '../services/verticals.service';
import { LoggerService } from '../../../logger/services/logger.service';
import { Request } from 'express';
import { CreateVerticalDto } from '../validation/create-vertical.dto';

@Controller('api/admin/dashboard/verticals')
export class VerticalsController {
  constructor(
    private readonly verticalsService: VerticalsService,
    private readonly logger: LoggerService,) { }

  @Get()
  @Roles(Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllVerticals(@Req() request: Request & { user: AdminJwtPayload },) {
    try {
      const response = await this.verticalsService.getAllVerticals(
        request.user.id
      );

      this.logger.log(
        'Response status 200',
        `${VerticalsController.name}#getAllVerticals`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${VerticalsController.name}#getAllVerticals`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post()
  @Roles(Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createVerticalDto: CreateVerticalDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    return this.verticalsService.create(createVerticalDto, request.user);
  }

  @Delete(':id')
  @Roles(Role.Merchant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(
    @Param('id') id: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    return this.verticalsService.delete(id, request.user);
  }
}
