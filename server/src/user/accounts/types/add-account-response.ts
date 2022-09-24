import { ApiProperty } from '@nestjs/swagger';

export class AddAccountResponse {
  @ApiProperty()
  accountId: string;
}
