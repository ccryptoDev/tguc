import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScreenTracking } from '../entities/screen-tracking.entity';

@Injectable()
export class ScreenTrackingService {
  constructor(
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
  ) {}

  async setCompleted(userId: string): Promise<ScreenTracking | null> {
    await this.screenTrackingModel.update(
      { user: userId },
      { isCompleted: true },
    );

    const completedScreenTracking = await this.screenTrackingModel.findOne({
      where: {
        user: userId,
      },
    });

    return completedScreenTracking;
  }
}
