import { ApiProperty } from '@nestjs/swagger';

export class GetLoanCounters {
  @ApiProperty()
  opportunities: number;

  @ApiProperty()
  inRepayment: number;

  @ApiProperty()
  denied: number;

  @ApiProperty()
  expired: number;
}
