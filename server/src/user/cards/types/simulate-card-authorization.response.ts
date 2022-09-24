import { ApiProperty } from '@nestjs/swagger';

export class SimulateCardAuthorizationResponse {
  @ApiProperty()
  auth_id: string;
}
