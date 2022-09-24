import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { Admin } from './entities/admin.entity';
import { LogActivityService } from './dashboard/log-activity/services/log-activity.service';
import { LogActivity } from './dashboard/log-activity/entities/log-activity.entity';
import { LogActivityController } from './dashboard/log-activity/controllers/log-activity.controller';
import { AdminDashboardService } from './dashboard/services/dashboard.service';
import { AdminDashboardController } from './dashboard/controllers/dashboard.controller';
import { CommentsService } from './dashboard/comments/services/comments.service';
import { CommentsController } from './dashboard/comments/controllers/comments.controller';
import { PracticeManagementService } from './dashboard/practice-management/services/practice-management.service';
import { PracticeManagementController } from './dashboard/practice-management/controllers/practice-management.controller';
import { CountersModule } from '../counters/counters.module';
import { LoggerModule } from '../logger/logger.module';
import { LoansModule } from '../loans/loans.module';
import { Comments } from './dashboard/comments/entities/comments.entity';
import { PracticeManagement } from './dashboard/practice-management/entities/practice-management.entity';
import { UserModule } from '../user/user.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { AppService } from '../app.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { EmailModule } from '../email/email.module';
import { HtmlParserModule } from '../html-parser/html-parser.module';
import { SendGridService } from '../email/services/sendgrid.service';
import { NunjucksService } from '../html-parser/services/nunjucks.service';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../sms/services/twilio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      LogActivity,
      Comments,
      PracticeManagement,
    ]),
    CountersModule,
    LoggerModule,
    forwardRef(() => LoansModule),
    forwardRef(() => UserModule),
    FileStorageModule,
    forwardRef(() => AuthenticationModule),
    EmailModule,
    HtmlParserModule,
  ],
  controllers: [
    AdminController,
    LogActivityController,
    AdminDashboardController,
    CommentsController,
    PracticeManagementController,
  ],
  providers: [
    AdminService,
    LogActivityService,
    AdminDashboardService,
    CommentsService,
    PracticeManagementService,
    AppService,
    SendGridService,
    NunjucksService,
    ConfigService,
    TwilioService,
  ],
  exports: [
    TypeOrmModule,
    AdminService,
    LogActivityService,
    AdminDashboardService,
    CommentsService,
    PracticeManagementService,
  ],
})
export class AdminModule {}
