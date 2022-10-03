import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../../logger/logger.module';
import { UserModule } from '../../user.module';
import { Instnt } from './entities/instnt.entity';
import { InstntService } from './services/instnt.service';
import { InstntController } from './controllers/instnt.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Instnt]),
    LoggerModule,
    forwardRef(() => UserModule),
  ],
  providers: [InstntService],
  controllers: [InstntController],
  exports: [InstntService],
})
export class InstntModule { }
