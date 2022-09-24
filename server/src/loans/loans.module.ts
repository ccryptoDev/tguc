import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from '../user/user.module';
import { ApplicationService } from './application/services/application.service';
import { ApplicationCronService } from './application/services/application-cron.service'
import { ApplicationController } from './application/controllers/application.controller';
import { PaymentManagementCronService } from './payments/payment-management/payment-management-cron.service';
import { LoanSettingsService } from './loan-settings/services/loan-settings.service';
import { MathExtService } from './mathext/services/mathext.service';
import { LedgerService } from './ledger/services/ledger.service';
import { PaymentManagementService } from './payments/payment-management/payment-management.service';
import { PaymentManagementController } from './payments/payment-management/payment-management.controller';
import { PaymentService } from './payments/services/payment.service';
import { PaymentController } from './payments/controllers/payment.controller';
import { PaymentCronService } from './payments/services/payment-cron.service';
import { LoanpaymentproService } from './payments/loanpaymentpro/loanpaymentpro.service';
import { LoanpaymentproController } from './payments/loanpaymentpro/loanpaymentpro.controller';
import { ApplicationLinkService } from './application/link/services/link.service';
import { LinkController } from './application/link/controllers/link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentManagement } from './payments/payment-management/payment-management.entity';
import { LoanSettings } from './loan-settings/entities/loan-settings.entity';
import { ApplicationLink } from './application/link/entities/link.entity';
import { Payment } from './payments/entities/payment.entity';
import { LoanPaymentProCardSale } from './payments/loanpaymentpro/loanpaymentpro-card-sale.entity';
import { LoanPaymentProCardToken } from './payments/loanpaymentpro/loanpaymentpro-card-token.entity';
import { Agreement } from './entities/agreement.entity';
import { LoanInterestRate } from './entities/interest-rate.entity';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { AppService } from '../app.service';
import { LoggerModule } from '../logger/logger.module';
import { EmailModule } from '../email/email.module';
import { HtmlParserModule } from '../html-parser/html-parser.module';
import { CountersModule } from '../counters/counters.module';
import { AdminModule } from '../admin/admin.module';
import { SmsModule } from '../sms/sms.module';
import loanPaymentProConfig from './payments/loanpaymentpro/loanpaymentpro.config';
import linkConfig from './application/link/link.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentManagement,
      LoanSettings,
      ApplicationLink,
      Payment,
      LoanPaymentProCardSale,
      LoanPaymentProCardToken,
      Agreement,
      LoanInterestRate,
    ]),
    ConfigModule.forRoot({
      load: [loanPaymentProConfig, linkConfig],
    }),
    forwardRef(() => UserModule),
    forwardRef(() => AdminModule),
    FileStorageModule,
    LoggerModule,
    EmailModule,
    HtmlParserModule,
    CountersModule,
    SmsModule,
  ],
  providers: [
    ApplicationService,
    ApplicationCronService,
    PaymentManagementCronService,
    LoanSettingsService,
    MathExtService,
    LedgerService,
    PaymentManagementService,
    PaymentService,
    PaymentCronService,
    LoanpaymentproService,
    ApplicationLinkService,
    AppService,
  ],
  controllers: [
    ApplicationController,
    PaymentManagementController,
    PaymentController,
    LoanpaymentproController,
    LinkController,
  ],
  exports: [
    TypeOrmModule,
    ApplicationService,
    ApplicationCronService,
    LoanSettingsService,
    MathExtService,
    LedgerService,
    PaymentManagementService,
    PaymentService,
    LoanpaymentproService,
    ApplicationLinkService,
  ],
})
export class LoansModule {}
