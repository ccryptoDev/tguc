import { ApiProperty } from '@nestjs/swagger';

export class CreditInquiryResponse {
  @ApiProperty()
  isLoanApproved: boolean;
}
