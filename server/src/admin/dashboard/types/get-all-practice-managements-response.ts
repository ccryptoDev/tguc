import { ApiProperty } from '@nestjs/swagger';

import { PracticeManagement } from '../practice-management/entities/practice-management.entity';

export class GetAllPracticeManagementsResponse {
  @ApiProperty({ type: [PracticeManagement] })
  items: PracticeManagement[];

  @ApiProperty()
  total: number;
}
