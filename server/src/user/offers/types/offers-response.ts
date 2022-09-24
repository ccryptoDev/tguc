import { ApiProperty } from '@nestjs/swagger';

export class Offer {
  @ApiProperty()
  adjWeightMax: number;

  @ApiProperty()
  downPayment: number;

  @ApiProperty()
  dtiMax: number;

  @ApiProperty()
  dtiMin: number;

  @ApiProperty()
  ficoMax: number;

  @ApiProperty()
  ficoMin: number;

  @ApiProperty()
  financedAmount: number;

  @ApiProperty()
  fundingSource: string;

  @ApiProperty()
  grade: string;

  @ApiProperty()
  loanAmount: number;

  @ApiProperty()
  loanId: string;

  @ApiProperty()
  maxLoanAmt: number;

  @ApiProperty()
  minLoanAmt: number;

  @ApiProperty()
  paymentFrequency: string;

  @ApiProperty()
  apr: number;

  @ApiProperty()
  decimalAmount: string;

  @ApiProperty()
  financeCharge: number;

  @ApiProperty()
  fullNumberAmount: string;

  @ApiProperty()
  interestRate: number;

  @ApiProperty()
  monthlyPayment: number;

  @ApiProperty()
  postDTI: number;

  @ApiProperty()
  term: number;

  @ApiProperty()
  totalLoanAmount: number;

  @ApiProperty()
  promoApr: number;

  @ApiProperty()
  promoDecimalAmount: string;

  @ApiProperty()
  promoFinanceCharge: number;

  @ApiProperty()
  promoFullNumberAmount: string;

  @ApiProperty()
  promoInterestRate: number;

  @ApiProperty()
  promoMonthlyPayment: number;

  @ApiProperty()
  promoPostDTI: number;

  @ApiProperty()
  promoTerm: number;

  @ApiProperty()
  promoTotalLoanAmount: number;

  @ApiProperty()
  canUsePromo: boolean;

  @ApiProperty()
  promoSelected: boolean;
}

export class OffersResponse {
  @ApiProperty()
  status: string;

  @ApiProperty()
  approvedUpTo: number;

  @ApiProperty()
  minimumAmount: number;

  @ApiProperty({ type: [Offer] })
  offers: Offer[];
}
