import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import history from 'connect-history-api-fallback';

import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { LoggerModule } from './logger/logger.module';
import { RequestLoggerService } from './logger/services/request-logger.service';
import { UserModule } from './user/user.module';
import { CountersModule } from './counters/counters.module';
import { AdminModule } from './admin/admin.module';
import { LoansModule } from './loans/loans.module';
import { EmailModule } from './email/email.module';
import { PlaidModule } from './user/underwriting/plaid/plaid.module';
import { SmsModule } from './sms/sms.module';
import { PdfModule } from './pdf/pdf.module';
import { HtmlParserModule } from './html-parser/html-parser.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import appConfig from './app.config';
import { ScheduleModule } from '@nestjs/schedule';

const {
  databasePort,
  databaseUsername,
  databasePassword,
  databaseName,
  synchronizeDatabase,
  dbHost,
} = appConfig();

@Module({
  imports: [
    ConfigModule.forRoot({ load: [appConfig], isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '../../../client/build'),
      exclude: ['/api*'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: databasePort,
      username: databaseUsername,
      password: databasePassword,
      database: databaseName,
      synchronize: synchronizeDatabase,
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    AuthenticationModule,
    LoggerModule,
    UserModule,
    CountersModule,
    AdminModule,
    LoansModule,
    EmailModule,
    SmsModule,
    PdfModule,
    HtmlParserModule,
    FileStorageModule,
    PlaidModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(history()).exclude('/api(.*)');
    consumer.apply(RequestLoggerService).forRoutes('*');
  }
}
