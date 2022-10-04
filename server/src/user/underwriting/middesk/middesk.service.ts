import axios, { AxiosResponse } from 'axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { setTimeout } from 'timers';
import { Repository } from 'typeorm';
import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { ConfigService } from '@nestjs/config';
import { MiddeskReport, MiddeskReportPayload } from './middesk.entity';

interface CreateMiddeskDTO {
  screenTrackingId: string;
  report: MiddeskReportPayload;
}

@Injectable()
export class MiddeskService {
  constructor(
    @InjectRepository(MiddeskReport)
    private readonly middeskRepository: Repository<MiddeskReport>,
    private readonly configService: ConfigService,
  ) {}

  public async create(
    createMiddeskDto: CreateMiddeskDTO,
  ): Promise<MiddeskReport> {
    const { screenTrackingId, report } = createMiddeskDto;
    let middesk = await this.middeskRepository.findOne({
      screenTracking: screenTrackingId,
    });

    if (!middesk) {
      middesk = new MiddeskReport();
      middesk.screenTracking = screenTrackingId;
      middesk.middesk_id = report.id;
      middesk.report = JSON.stringify({ middesk: report });

      await this.middeskRepository.save(middesk);
    }

    return middesk;
  }

  public async getReport(
    practice: PracticeManagement,
  ): Promise<MiddeskReportPayload> {
    const middeskRequestPayload = {
      addresses: [
        {
          address_line1: practice.address,
          city: practice.city,
          postal_code: practice.zip,
          state: practice.stateCode,
        },
      ],
      name: practice.practiceName,
      people: [
        {
          name: practice.contactName,
        },
      ],
      phone_numbers: [
        {
          phone_number: practice.phone,
        },
      ],
      tin: {
        tin: practice.tin,
      },
    };
    const middesk_url = this.configService.get<string>('middeskurl');
    const middesk_key = this.configService.get<string>('middeskkey');

    const { data }: { data: MiddeskReportPayload } = await axios.post(
      `${middesk_url}/businesses`,
      middeskRequestPayload,
      {
        headers: {
          Authorization: `Bearer ${middesk_key}`,
        },
      },
    );

    const updatedMiddeskReport = await this.findReport(data.id);
    return updatedMiddeskReport;
  }

  public async findByLoanId(screenTrackingId: string): Promise<MiddeskReport> {
    const middesk = await this.middeskRepository.findOne({
      screenTracking: screenTrackingId,
    });

    // if (!middesk) {
    //   throw new NotFoundException({
    //     status: 404,
    //     message: 'No Middesk report found for the given loan ID',
    //   });
    // }

    return middesk;
  }

  private async findReport(reportId: string): Promise<MiddeskReportPayload> {
    let data: any;
    let currentReportStatus = '';
    const middesk_url = this.configService.get<string>('middeskurl');
    const middesk_key = this.configService.get<string>('middeskkey');
    while (currentReportStatus !== 'in_review') {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await axios.get(
        `${middesk_url}/businesses/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${middesk_key}`,
          },
        },
      );

      data = response.data;
      currentReportStatus = data?.status;
    }

    return data;
  }
}
