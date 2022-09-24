import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { User } from './entities/user.entity';
import { State } from './entities/state.entity';
import { UserService } from './services/user.service';
import { ScreenTrackingService } from './screen-tracking/services/screen-tracking.service';
import { ScreenTracking } from './screen-tracking/entities/screen-tracking.entity';
import { ActivityService } from './activity/services/activity.service';
import { UserActivity } from './activity/entities/activity.entity';
import { TransUnion } from './underwriting/transunion/entities/transunion.entity';
import { TransunionService } from './underwriting/transunion/services/transunion.service';
import { TransunionController } from './underwriting/transunion/controllers/transunion.controller';
import { ProductService } from './underwriting/product/services/product.service';
import { ConsentService } from './consent/services/consent.service';
import { ConsentController } from './consent/controllers/consent.controller';
import { GalileoService } from './cards/services/galileo.service';
import { GalileoController } from './cards/controllers/galileo.controller';
import { DashboardService } from './dashboard/services/dashboard.service';
import { DashboardController } from './dashboard/controllers/dashboard.controller';
import { UserDocumentsService } from './documents/services/documents.service';
import { OffersService } from './offers/services/offers.service';
import { OffersController } from './offers/controllers/offers.controller';
import { LoggerModule } from '../logger/logger.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserConsent } from './consent/entities/consent.entity';
import { ProductRules } from './underwriting/product/entities/product-rules.entity';
import { ESignature } from './esignature/entities/esignature.entity';
import { UserDocuments } from './documents/entities/documents.entity';
import { LoansModule } from '../loans/loans.module';
import { AdminModule } from '../admin/admin.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { CountersModule } from '../counters/counters.module';
import { AppService } from '../app.service';
import { TransUnionHistory } from './underwriting/transunion/entities/transunion-history.entity';
import { PdfModule } from '../pdf/pdf.module';
import { HtmlParserModule } from '../html-parser/html-parser.module';
import { UserController } from './controllers/user.controller';
import { EsignatureService } from './esignature/services/esignature.service';
import { EsignatureController } from './esignature/controllers/esignature.controller';
import { DocumentsController } from './documents/controllers/documents.controller';
import { Card } from './cards/entities/card.entity';
import { Transactions } from './cards/entities/transactions.entity';
import { Account } from './accounts/entities/account.entity';
import { AccountsService } from './accounts/services/account.service';
import { AccountsController } from './accounts/controllers/account.controller';
import galileoConfig from './cards/galileo.config';
import transunionConfig from './underwriting/transunion/transunion.config';
import productConfig from './underwriting/product/product.config';
import flinksConfig from './accounts/flinks.config';
import { PlaidService } from './underwriting/plaid/plaid.service';
import { Plaid } from './underwriting/plaid/plaid.entity';
import { PlaidController } from './underwriting/plaid/plaid.controller';
import { EmailModule } from '../email/email.module';
import { SendGridService } from '../email/services/sendgrid.service';
import { VerticalsModule } from './verticals/verticals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      State,
      ScreenTracking,
      UserActivity,
      TransUnion,
      TransUnionHistory,
      UserConsent,
      ProductRules,
      ESignature,
      UserDocuments,
      Card,
      Transactions,
      Account,
      Plaid,
    ]),
    ConfigModule.forRoot({
      load: [galileoConfig, transunionConfig, productConfig, flinksConfig],
    }),
    LoggerModule,
    forwardRef(() => AuthenticationModule),
    forwardRef(() => LoansModule),
    forwardRef(() => AdminModule),
    FileStorageModule,
    CountersModule,
    PdfModule,
    HtmlParserModule,
    EmailModule,
    VerticalsModule,
  ],
  providers: [
    UserService,
    ScreenTrackingService,
    ActivityService,
    TransunionService,
    ProductService,
    ConsentService,
    GalileoService,
    DashboardService,
    UserDocumentsService,
    OffersService,
    AppService,
    EsignatureService,
    AccountsService,
    SendGridService,
    PlaidService,
  ],
  controllers: [
    TransunionController,
    ConsentController,
    GalileoController,
    DashboardController,
    OffersController,
    UserController,
    EsignatureController,
    DocumentsController,
    AccountsController,
    PlaidController,
  ],
  exports: [
    TypeOrmModule,
    ConsentService,
    UserService,
    ScreenTrackingService,
    ActivityService,
    TransunionService,
    ProductService,
    GalileoService,
    DashboardService,
    UserDocumentsService,
    OffersService,
    SendGridService,
    PlaidService,
  ],
})
export class UserModule {}
