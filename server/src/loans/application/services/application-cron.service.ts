import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getManager } from 'typeorm';
import { SendGridService } from '../../../email/services/sendgrid.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import Config from '../../../app.config';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApplicationCronService {
  constructor(
    private readonly sendGridService: SendGridService,
    private readonly nunjucksService: NunjucksService,
    private readonly configService: ConfigService,
  ) { }

  private readonly logger = new Logger(ApplicationCronService.name);

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async finalNotice() {
    this.logger.log(
      'Sending final notice email (7 days without changes in the application)',
    );
    const manager = getManager();
    const loanData = await manager.query(
      `SELECT *, l.id, c."updatedAt" as cupdated, l."updatedAt" as lupdated from public."user" c INNER JOIN public."screen_tracking" l ON c.id = l."userId" WHERE l."lastScreen" != 'thank-you' AND l."isContractor" = 'false'`,
    );

    for (const data of loanData) {
      const lastUpdatedLoan = new Date(data.lupdated).getTime();
      const today = new Date().getTime();
      const difference = today - lastUpdatedLoan;
      const differenceInDays = moment(difference).format('D');

      if (differenceInDays === '7') {
        const context = {
          firstName: data.firstName,
          baseUrl: Config().baseUrl,
        };

        const html: string = await this.nunjucksService.htmlToString(
          'emails/application-final-notice-borrower.html',
          context,
        );
        const fromName = this.configService.get<string>('sendGridFromName');
        const fromEmail = this.configService.get<string>('sendGridFromEmail');
        await this.sendGridService.sendEmail(
          `${fromName} <${fromEmail}>`,
          data.email,
          `TGUC Credit Application #${data.applicationReference}`,
          html,
          '@CronEmail:finalNotice',
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async incompleteApplication1Hour() {
    this.logger.log('Sending incomplete email (1 hour without changes)');
    const manager = getManager();
    const loanData = await manager.query(
      `SELECT *, l.id, c."updatedAt" as cupdated, l."updatedAt" as lupdated from public."user" c INNER JOIN public."screen_tracking" l ON c.id = l."userId" WHERE l."lastScreen" = 'address-information' AND l."isContractor" = 'false'`,
    );

    for (const data of loanData) {
      const lastUpdatedLoan = new Date(data.lupdated).getTime();

      const today = new Date().getTime();

      const todayToString = new Date().toDateString();
      const lastUpdatedLoanToString = new Date(data.lupdated).toDateString();

      const differenceInHours = Math.abs(today - lastUpdatedLoan) / 36e5;

      //Check if the application was created today and if it has been 1 hour since the last modification
      if (
        todayToString === lastUpdatedLoanToString &&
        differenceInHours >= 1 &&
        differenceInHours < 2
      ) {
        const context = {
          firstName: data.firstName,
          baseUrl: Config().baseUrl,
        };

        const html: string = await this.nunjucksService.htmlToString(
          'emails/application-incomplete-borrower.html',
          context,
        );
        const fromName = this.configService.get<string>('sendGridFromName');
        const fromEmail = this.configService.get<string>('sendGridFromEmail');
        await this.sendGridService.sendEmail(
          `${fromName} <${fromEmail}>`,
          data.email,
          `TGUC Credit Application #${data.applicationReference}`,
          html,
          '@CronEmail:incompleteApplication1Hour',
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async incompleteApplication24Hour() {
    this.logger.log(
      'Sending incomplete application notice (1 day without changes in the application)',
    );
    const manager = getManager();
    const loanData = await manager.query(
      `SELECT *, l.id, c."updatedAt" as cupdated, l."updatedAt" as lupdated from public."user" c INNER JOIN public."screen_tracking" l ON c.id = l."userId" WHERE l."lastScreen" = 'address-information' AND l."isContractor" = 'false'`,
    );

    for (const data of loanData) {
      const lastUpdatedLoan = new Date(data.lupdated).getTime();
      const today = new Date().getTime();
      const difference = today - lastUpdatedLoan;
      const differenceInDays = moment(difference).format('D');

      if (differenceInDays === '1') {
        const context = {
          firstName: data.firstName,
          baseUrl: Config().baseUrl,
        };

        const html: string = await this.nunjucksService.htmlToString(
          'emails/application-incomplete-borrower.html',
          context,
        );
        const fromName = this.configService.get<string>('sendGridFromName');
        const fromEmail = this.configService.get<string>('sendGridFromEmail');
        await this.sendGridService.sendEmail(
          `${fromName} <${fromEmail}>`,
          data.email,
          `TGUC Credit Application #${data.applicationReference}`,
          html,
          '@CronEmail:incompleteApplication24Hour',
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async incompleteApplication72Hour() {
    this.logger.log(
      'Sending incomplete application notice (3 days without changes in the application)',
    );
    const manager = getManager();
    const loanData = await manager.query(
      `SELECT *, l.id, c."updatedAt" as cupdated, l."updatedAt" as lupdated from public."user" c INNER JOIN public."screen_tracking" l ON c.id = l."userId" WHERE l."lastScreen" = 'address-information' AND l."isContractor" = 'false'`,
    );

    for (const data of loanData) {
      const lastUpdatedLoan = new Date(data.lupdated).getTime();
      const today = new Date().getTime();
      const difference = today - lastUpdatedLoan;
      const differenceInDays = moment(difference).format('D');

      if (differenceInDays === '3') {
        const context = {
          firstName: data.firstName,
          baseUrl: Config().baseUrl,
        };

        const html: string = await this.nunjucksService.htmlToString(
          'emails/application-incomplete-borrower.html',
          context,
        );
        const fromName = this.configService.get<string>('sendGridFromName');
        const fromEmail = this.configService.get<string>('sendGridFromEmail');
        await this.sendGridService.sendEmail(
          `${fromName} <${fromEmail}>`,
          data.email,
          `TGUC Credit Application #${data.applicationReference}`,
          html,
          '@CronEmail:incompleteApplication72Hour',
        );
      }
    }
  }
}
