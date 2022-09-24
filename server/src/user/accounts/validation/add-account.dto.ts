import { IsNotEmpty, IsString } from 'class-validator';

export class AddAccountDto {
  @IsNotEmpty()
  @IsString()
  loginId: string;

  @IsNotEmpty()
  @IsString()
  institution: string;

  screenTrackingId: string;
  userId: string;
}
