import { ApiProperty } from '@nestjs/swagger';

import { TransUnion } from '../../../user/underwriting/transunion/entities/transunion.entity';

class UserData {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  middleName: string;

  @ApiProperty()
  ssn: string;

  @ApiProperty()
  creditScore: string;
}

export class GetCreditReportResponse {
  @ApiProperty({ type: UserData })
  user: UserData;

  @ApiProperty({ type: TransUnion })
  creditReport: TransUnion;
}
