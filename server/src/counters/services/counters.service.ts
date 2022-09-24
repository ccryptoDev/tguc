import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoggerService } from '../../logger/services/logger.service';
import { Counters } from '../entities/counters.entity';

@Injectable()
export class CountersService {
  constructor(
    @InjectRepository(Counters)
    private readonly applicationReferenceModel: Repository<Counters>,
    private readonly logger: LoggerService,
  ) {}

  async getNextSequenceValue(sequenceName: string, requestId: string) {
    this.logger.log(
      'Generating next sequence value with params:',
      `${CountersService.name}#getNextSequenceValue`,
      requestId,
      { sequenceName },
    );

    const existingCounter = await this.applicationReferenceModel.findOne({
      where: { appType: sequenceName },
    });

    let result: Counters;
    if (!existingCounter) {
      const newCounter = this.applicationReferenceModel.create({
        appType: sequenceName,
        sequenceValue: '1',
      });
      await this.applicationReferenceModel.save(newCounter);

      result = newCounter;
    } else {
      existingCounter.sequenceValue = +existingCounter.sequenceValue + 1 + '';
      await this.applicationReferenceModel.save(existingCounter);

      result = existingCounter;
    }

    this.logger.log(
      'Next sequence value generated',
      `${CountersService.name}#getNextSequenceValue`,
      requestId,
      result,
    );

    return result;
  }
}
