import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class GetCreditSummaryDto {
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  accountNumber: string;
}
