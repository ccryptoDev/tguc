import { IsBoolean } from 'class-validator';

export class ExperianCreditInquiryDto {
  screenTrackingId: string;

  @IsBoolean()
  hardPull: boolean;
}
