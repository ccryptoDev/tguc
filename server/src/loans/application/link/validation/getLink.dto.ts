import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetLinkDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
