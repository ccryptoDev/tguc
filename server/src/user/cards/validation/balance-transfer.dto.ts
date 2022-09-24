import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class BalanceTransferDto {
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  accountNumber: string;

  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  amount: string;

  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  accountNumberToTransfer: string;
}
