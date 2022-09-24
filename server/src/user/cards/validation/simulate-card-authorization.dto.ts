import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

// TODO delete this once we start receiving transactions via events
export class SimulateCardAuthorizationDto {
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  accountNumber: string;

  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => value.trim())
  amount: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  association: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  merchantName: string;
}
