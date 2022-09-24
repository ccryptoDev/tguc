import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaidService } from './plaid.service';
import { PlaidController } from './plaid.controller';
import plaidConfig from './plaid.config';
import { AppService } from '../../../app.service';
import { SendGridService } from '../../../email/services/sendgrid.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { LoggerModule } from '../../../logger/logger.module';
import { UserModule } from '../../user.module';
import { Plaid } from './plaid.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plaid]),
    ConfigModule.forRoot({ load: [plaidConfig] }),
    LoggerModule,
    UserModule,
  ],
  providers: [PlaidService, AppService, SendGridService, NunjucksService],
  controllers: [PlaidController],
  exports: [PlaidService],
})
export class PlaidModule {}
