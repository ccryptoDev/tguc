import { IsNotEmpty, IsString } from 'class-validator';

export class SaveInstntDataDto {

  @IsNotEmpty()
  @IsString()
  formKey: string;

  @IsNotEmpty()
  @IsString()
  decision: string;

  @IsNotEmpty()
  @IsString()
  instntJwt: string;

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  userId?: string;

  @IsNotEmpty()
  @IsString()
  screenTrackingId?: string;
}
