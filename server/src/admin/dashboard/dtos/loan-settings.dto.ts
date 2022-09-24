import { IsPositive } from 'class-validator';

export class LoanSettingsDto {
  @IsPositive()
  lateFee: number;

  @IsPositive()
  nsfFee: number;

  @IsPositive()
  lateFeeGracePeriod: number;

  @IsPositive()
  delinquencyPeriod: number;
}
