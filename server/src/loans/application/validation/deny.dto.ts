import { IsNotEmpty, IsString } from 'class-validator';

export class DenyDto {
  @IsNotEmpty()
  @IsString()
  reasonOptions: string[];
  reasonValue: string;
}
