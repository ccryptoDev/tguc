import { ApiProperty } from '@nestjs/swagger';

import { UserData } from '../types/user-data';

export class GetAllUsersResponse {
  @ApiProperty({ type: UserData })
  items: UserData[];

  @ApiProperty()
  total: number;
}
