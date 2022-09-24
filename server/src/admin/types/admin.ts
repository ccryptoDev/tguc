import { ApiProperty } from '@nestjs/swagger';

export class Admin {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  createdDate: Date;
}
