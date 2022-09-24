import { ApiProperty } from '@nestjs/swagger';

export class UserData {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userReference: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  registerStatus: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  createdDate: Date;
}
