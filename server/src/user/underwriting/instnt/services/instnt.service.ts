import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from '../../../../logger/services/logger.service';
import { SaveInstntDataDto } from "../validation/saveInstntData.dto";
import { Instnt } from "../entities/instnt.entity";
import { ScreenTracking } from 'src/user/screen-tracking/entities/screen-tracking.entity';


@Injectable()
export class InstntService {
  constructor(
    @InjectRepository(Instnt)
    private readonly insntModel: Repository<Instnt>,
    private readonly logger: LoggerService,
  ) { }

  async findByScreenTrackingId(screenTrackingId: string) {
    return await this.insntModel.findOne({
      where: {
        screenTracking: screenTrackingId,
      },
      relations: ['screenTracking', 'user']
    });
  }

  async find(
    instntPayload: SaveInstntDataDto,
    requestId: string,
  ) {
    this.logger.log(
      'find: InstntService find instnt data by screenTrackingId & transactionId:',
      `${InstntService.name}#find`,
      requestId,
      instntPayload,
    );
    return await this.insntModel.findOne({
      where: {
        screenTracking: instntPayload.screenTrackingId,
        // transactionId: instntPayload.transactionId,
      },
      relations: ['screenTracking', 'user']
    });
  }

  async saveInstntData(
    instntData: SaveInstntDataDto,
    requestId: string,
  ) {
    this.logger.log(
      'saveInstntData InstntService request data object with params:',
      `${InstntService.name}#saveInstntData`,
      requestId,
      instntData,
    );

    const payload = {
      screenTracking: instntData.screenTrackingId,
      user: instntData.userId,
      formKey: instntData.formKey,
      decision: instntData.decision,
      instntJwt: instntData.instntJwt,
      transactionId: instntData.transactionId
    };

    return await this.insntModel.save(payload);
  }
}
