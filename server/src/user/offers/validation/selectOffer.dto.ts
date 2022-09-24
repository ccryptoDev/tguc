import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class SelectOfferDto {
  @IsNotEmpty()
  @IsUUID(4)
  loanId: string;

  @IsBoolean()
  promoSelected: boolean;

  @IsBoolean()
  skipAutoPay: boolean;

  // Extracted from JWT
  screenTrackingId: string;
}
