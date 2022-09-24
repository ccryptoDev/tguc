import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class CashLoadDto {
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  accountNumber: string;

  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  amount: string;
}
