import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppService } from '../../../../app.service';
import { ApplicationLink } from '../entities/link.entity';
import { CreateLinkDto } from '../validation/createLink.dto';
import { GetLinkDto } from '../validation/getLink.dto';
import { PracticeManagement } from '../../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { LoggerService } from '../../../../logger/services/logger.service';
import { SendGridService } from '../../../../email/services/sendgrid.service';
import { TwilioService } from '../../../../sms/services/twilio.service';
import { NunjucksService } from '../../../../html-parser/services/nunjucks.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ApplicationLinkService {
  constructor(
    @InjectRepository(ApplicationLink)
    private readonly applicationLinkModel: Repository<ApplicationLink>,
    @InjectRepository(PracticeManagement)
    private readonly practiceManagementModel: Repository<PracticeManagement>,
    private readonly sendGridService: SendGridService,
    private readonly twilioService: TwilioService,
    private readonly nunjucksService: NunjucksService,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async createLinkRecord(
    createLinkDto: CreateLinkDto,
    requestId: string,
  ): Promise<{ applicationLinkUrl: string; id: string }> {
    const { firstName, practiceManagement, email, phone, sendEmail, sendSms } =
      createLinkDto;
    this.logger.log(
      'Creating application link with params:',
      `${ApplicationLink.name}#createLinkRecord`,
      requestId,
      createLinkDto,
    );

    const practice: PracticeManagement =
      await this.practiceManagementModel.findOne({
        id: practiceManagement,
      });
    if (!practice) {
      this.logger.error(
        'Practice management not found',
        `${ApplicationLink.name}#createLinkRecord`,
        requestId,
        createLinkDto,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Practice management id '${practiceManagement}' not found`,
          requestId,
        ),
      );
    }

    let applicationLink = this.applicationLinkModel.create(createLinkDto);
    applicationLink = await this.applicationLinkModel.save(applicationLink);

    this.logger.log(
      'Application link created:',
      `${ApplicationLink.name}#createLinkRecord`,
      requestId,
      applicationLink,
    );

    const applicationLinkUrl = `${this.configService.get<string>(
      'baseUrl',
    )}/apply/link/${applicationLink.id}`;

    if (sendEmail) {
      const html = await this.nunjucksService.htmlToString(
        'emails/application-link.html',
        {
          link: applicationLinkUrl,
          firstName,
        },
      );
      const from = this.configService.get<string>('sendersEmail');
      const subject = this.configService.get<string>('emailSubject');
      await this.sendGridService.sendEmail(
        from,
        email,
        subject,
        html,
        requestId,
      );
    }
    if (sendSms) {
      const smsMessage = this.configService.get<string>('smsTemplate');
      await this.twilioService.sendTextMessage(
        phone,
        `${smsMessage} ${applicationLinkUrl}`,
        requestId,
      );
    }

    this.logger.log(
      'Application link generated:',
      `${ApplicationLinkService.name}#createLinkRecord`,
      requestId,
      applicationLinkUrl,
    );

    return { applicationLinkUrl, id: applicationLink.id };
  }

  async getLinkRecord(getLinkDto: GetLinkDto, requestId: string) {
    this.logger.log(
      'Getting application link with params:',
      `${ApplicationLinkService.name}#getLinkRecord`,
      requestId,
      getLinkDto,
    );
    const { id } = getLinkDto;
    const applicationLink: ApplicationLink | null =
      await this.applicationLinkModel.findOne({
        where: {
          id,
        },
        relations: ['practiceManagement'],
      });
    if (!applicationLink) {
      this.logger.error(
        'Application link not found',
        `${ApplicationLinkService.name}#getLinkRecord`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Application link id ${id}`,
          requestId,
        ),
      );
    }

    this.logger.log(
      'Got application link:',
      `${ApplicationLinkService.name}#getLinkRecord`,
      requestId,
      applicationLink,
    );
    return applicationLink;
  }
}
