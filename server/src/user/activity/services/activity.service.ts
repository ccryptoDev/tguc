import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserActivity } from '../entities/activity.entity';
import { LoggerService } from '../../../logger/services/logger.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly userActivityModel: Repository<UserActivity>,
    private readonly logger: LoggerService,
  ) {}

  async createUserActivity(
    requestData: { userId: string; logData: string },
    subject: string,
    description: string,
    requestId: string,
  ) {
    this.logger.log(
      'Saving user log activity with params:',
      `${ActivityService.name}#createUserActivity`,
      requestId,
      { ...requestData, subject, description },
    );
    try {
      const { userId, logData } = requestData;
      const logInfoData = {
        user: userId,
        subject,
        description,
        logData,
      };
      let logDetails = this.userActivityModel.create(logInfoData);
      logDetails = await this.userActivityModel.save(logDetails);
      this.logger.log(
        'Saved user log activity successfully',
        `${ActivityService.name}#createUserActivity`,
        requestId,
        logDetails,
      );

      return logDetails;
    } catch (error) {
      this.logger.error(
        'Error',
        `${ActivityService.name}#createUserActivity`,
        requestId,
        error,
      );
    }
  }
}
