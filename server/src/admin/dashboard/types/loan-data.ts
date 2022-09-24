import { ApiProperty } from '@nestjs/swagger';

export class LoanData {
  @ApiProperty()
  id: string;

  @ApiProperty()
  currentBalance: number;

  @ApiProperty()
  screenTrackingId: string;

  @ApiProperty()
  pmId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  interestRate: number;

  @ApiProperty()
  dateCreated: Date;

  @ApiProperty()
  approvedUpTo: number;

  @ApiProperty()
  selectedAmount: number;

  @ApiProperty()
  loanAmount: number;

  @ApiProperty()
  term: number;

  @ApiProperty()
  progress: string;

  @ApiProperty()
  status: string;
}
