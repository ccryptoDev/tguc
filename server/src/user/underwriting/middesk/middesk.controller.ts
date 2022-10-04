import { Controller, Get, Param, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { JwtAuthGuard } from '../../../authentication/strategies/jwt-auth.guard';
import { MiddeskService } from './middesk.service';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Middesk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans/:loanId/middesk')
export class MiddeskController {
  constructor(private readonly middeskService: MiddeskService) {}

  @ApiOperation({ summary: 'Find middesk report by loan ID' })
  @Get()
  public async findByLoanId(@Param('loanId') loanId: string): Promise<any> {
    const middesk = await this.middeskService.findByLoanId(loanId);

    return middesk;
  }
}
