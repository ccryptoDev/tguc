import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../logger/logger.module';
import { VerticalsController } from './controllers/verticals.controller';
import { Vertical } from './entities/vertical.entity';
import { VerticalsService } from './services/verticals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vertical]),
    LoggerModule,
  ],
  controllers: [VerticalsController],
  providers: [VerticalsService]
})
export class VerticalsModule { }
