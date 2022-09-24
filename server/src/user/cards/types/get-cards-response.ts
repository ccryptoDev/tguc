import { ApiProperty } from '@nestjs/swagger';

export class GetCardsResponse {
  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  cardNumber: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  expiryDate: string;

  @ApiProperty()
  isArchived: boolean;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  id: string;

  @ApiProperty()
  updatedAt: Date;
}
