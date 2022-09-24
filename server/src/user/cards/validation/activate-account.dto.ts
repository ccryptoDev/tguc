import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ActivateAccountDto {
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  accountNumber: string;
}
