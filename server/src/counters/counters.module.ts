import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CountersService } from './services/counters.service';
import { Counters } from './entities/counters.entity';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Counters]), LoggerModule],
  providers: [CountersService],
  exports: [TypeOrmModule, CountersService],
})
export class CountersModule {}
