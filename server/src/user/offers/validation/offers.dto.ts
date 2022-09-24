import { IsNotEmpty, Max, Min } from 'class-validator';

export class OffersDto {
  // Extracted from JWT
  screenTrackingId: string;

  @IsNotEmpty()
  @Min(1000)
  @Max(7000)
  requestedLoanAmount: number;
}
