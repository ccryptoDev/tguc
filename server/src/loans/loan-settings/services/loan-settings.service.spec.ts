import { Test, TestingModule } from '@nestjs/testing';
import { LoanSettingsService } from './loan-settings.service';

describe('LoanSettingsService', () => {
  let service: LoanSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanSettingsService],
    }).compile();

    service = module.get<LoanSettingsService>(LoanSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
