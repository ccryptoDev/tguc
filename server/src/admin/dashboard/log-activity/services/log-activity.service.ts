import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';

import { LogActivity } from '../entities/log-activity.entity';
import { CountersService } from '../../../../counters/services/counters.service';
import { AdminJwtPayload } from '../../../../authentication/types/jwt-payload.types';
import { LoggerService } from '../../../../logger/services/logger.service';
import GetPaginatedLogActivitiesDto from '../validation/get-paginated-log-activities.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  getRepository,
  Repository,
  WhereExpressionBuilder,
} from 'typeorm';

export enum logActivityModuleNames {
  ACCOUNTS = 'Accounts',
  APPLICATION_LINK = 'Application Link',
  DOCUMENT_UPLOAD = 'Document Upload',
  LENDING_CENTER = 'Lending Center',
  LOAN_DETAILS = 'Loan Details',
  LOAN_SETTINGS = 'Loan Settings',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
  MANAGE_APPLICANTS = 'Manage Applicants',
  MANAGE_PRACTICES = 'Manage Practices',
  MANAGE_USERS = 'Manage Users',
  OPPORTUNITIES = 'Opportunities',
  PAYMENT_SCHEDULE = 'Payment Schedule',
}

@Injectable()
export class LogActivityService {
  appService: any;
  constructor(
    @InjectRepository(LogActivity)
    private readonly logActivityModel: Repository<LogActivity>,
    private readonly CounterService: CountersService,
    private readonly logger: LoggerService,
  ) {}

  async createLogActivity(
    request: Request & { user: AdminJwtPayload },
    moduleName: string,
    message: string,
    data?: any,
    loanReference?: string,
    paymentManagementId?: string,
    screenTrackingId?: string,
  ) {
    this.logger.log(
      'Creating log activity with params:',
      `${LogActivityService.name}#`,
      request.id,
      {
        user: request.user,
        moduleName,
        message,
        data,
        loanReference,
        paymentManagementId,
        screenTrackingId,
      },
    );
    const reference = await this.CounterService.getNextSequenceValue(
      'logs',
      request.id,
    );

    const logInfo = {
      userId: request.user.id,
      jsonData: data ? JSON.stringify(data, null, '  ') : undefined,
      email: request.user?.email,
      ip: request.connection.remoteAddress,
      message,
      loanReference,
      logReference: `LOG_${reference.sequenceValue}`,
      moduleName,
      name: request.user.userName,
      paymentManagementId,
      practiceManagementId: request.user.practiceManagement,
      requestUri: request.url,
      screenTrackingId: screenTrackingId,
    };

    let response: LogActivity = this.logActivityModel.create(logInfo);
    response = await this.logActivityModel.save(response);
    this.logger.log(
      'Log activity created:',
      `${LogActivityService.name}#createLogActivity`,
      request.id,
      response,
    );

    return { logActivityId: response.id };
  }

  async createLogActivityUpdateUser(
    request: any,
    moduleName: string,
    message: string,
    data?: any,
    screenTrackingId?: string,
    user?: any,
  ) {
    this.logger.log(
      'Creating log activity with params:',
      `${LogActivityService.name}#`,
      request.id,
      {
        user: user,
        moduleName,
        message,
        data,
        screenTrackingId,
      },
    );
    const reference = await this.CounterService.getNextSequenceValue(
      'logs',
      request.id,
    );

    const logInfo = {
      userId: user.id,
      jsonData: data ? JSON.stringify(data, null, '  ') : undefined,
      email: user.email,
      ip: request.connection.remoteAddress,
      message,
      logReference: `LOG_${reference.sequenceValue}`,
      moduleName,
      name: user.userName,
      requestUri: request.url,
      practiceManagementId: user.practiceManagement,
      screenTrackingId: screenTrackingId,
    };

    let response: LogActivity = this.logActivityModel.create(logInfo);
    response = await this.logActivityModel.save(response);
    this.logger.log(
      'Log activity created:',
      `${LogActivityService.name}#createLogActivity`,
      request.id,
      response,
    );

    return { logActivityId: response.id };
  }

  async getAllLogActivities(
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all log activities with params:',
      `${LogActivityService.name}#getAllLogActivities`,
      requestId,
      { getPaginatedLogActivitiesDto },
    );
    const { page, perPage, search } = getPaginatedLogActivitiesDto;
    const logActivityResponse: [LogActivity[], number] = await getRepository(
      LogActivity,
    )
      .createQueryBuilder('logActivity')
      .where(
        new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
          if (search) {
            whereExpressionBuilder
              .where(`logActivity.loanReference ILIKE '%${search}%'`)
              .orWhere(`logActivity.logReference ILIKE '%${search}%'`)
              .orWhere(`logActivity.moduleName ILIKE '%${search}%'`)
              .orWhere(`logActivity.message ILIKE '%${search}%'`)
              .orWhere(`logActivity.ip ILIKE '%${search}%'`);
          }
        }),
      )
      .take(perPage)
      .skip((page - 1) * perPage)
      .orderBy('logActivity.createdAt', 'DESC')
      .getManyAndCount();

    const logs = logActivityResponse[0].map(
      ({
        id,
        createdAt,
        email,
        ip,
        loanReference,
        logReference,
        message,
        moduleName,
        screenTrackingId,
      }: any) => {
        return {
          id: id,
          createdDate: createdAt,
          email,
          ip,
          loanReference: loanReference ? loanReference : '--',
          logReference,
          message,
          moduleName,
          screenTrackingId,
        };
      },
    );
    const response = { items: logs, total: logActivityResponse[1] };
    this.logger.log(
      'Got log activities:',
      `${LogActivityService.name}#getAllLogActivities`,
      requestId,
      response,
    );

    return response;
  }

  async getLogActivityById(id: string, requestId: string) {
    this.logger.log(
      'Getting log activity with params:',
      `${LogActivityService.name}#getAdminById`,
      requestId,
      { id },
    );
    const logActivity: LogActivity | null = await this.logActivityModel.findOne(
      id,
    );

    if (!logActivity) {
      const errorMessage = `Could not find log id ${id}`;
      this.logger.error(
        errorMessage,
        `${LogActivityService.name}#getLogActivityById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Got log activity:',
      `${LogActivityService.name}#getLogActivityById`,
      requestId,
      logActivity,
    );

    return logActivity;
  }

  async getLogActivitiesByScreenTrackingId(
    screenTrackingId: string,
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all log activities by screen tracking id with params:',
      `${LogActivityService.name}#getLogActivitiesByScreenTrackingId`,
      requestId,
      { screenTrackingId, getPaginatedLogActivitiesDto },
    );
    const { page, perPage, search } = getPaginatedLogActivitiesDto;
    const logActivityResponse: [LogActivity[], number] = await getRepository(
      LogActivity,
    )
      .createQueryBuilder('logActivity')
      .where(
        new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
          whereExpressionBuilder.where(
            'logActivity.screenTrackingId = :screenTrackingId',
            { screenTrackingId },
          );

          if (search) {
            whereExpressionBuilder.andWhere(
              new Brackets(
                (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                  andWhereExpressionBuilder
                    .where(`logActivity.logReference ILIKE '%${search}%'`)
                    .orWhere(`logActivity.moduleName ILIKE '%${search}%'`)
                    .orWhere(`logActivity.message ILIKE '%${search}%'`);
                },
              ),
            );
          }
        }),
      )
      .take(perPage)
      .skip((page - 1) * perPage)
      .orderBy('logActivity.createdAt', 'DESC')
      .getManyAndCount();

    const logs = logActivityResponse[0].map(
      ({ createdAt, logReference, message, moduleName, id }: any) => {
        return {
          id,
          createdDate: createdAt,
          logReference,
          message,
          moduleName,
        };
      },
    );
    const response = { items: logs, total: logActivityResponse[1] };
    this.logger.log(
      'Got log activities by screen tracking id :',
      `${LogActivityService.name}#getLogActivitiesByScreenTrackingId`,
      requestId,
      response,
    );

    return response;
  }
}
