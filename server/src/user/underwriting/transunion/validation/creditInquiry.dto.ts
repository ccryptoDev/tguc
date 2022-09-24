import { IsBoolean } from 'class-validator';

export class CreditInquiryDto {
  screenTrackingId: string;

  @IsBoolean()
  hardPull: boolean;
}
