import { Test, TestingModule } from '@nestjs/testing';
import { TransunionService } from './transunion.service';

describe('TransunionService', () => {
  let service: TransunionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransunionService],
    }).compile();

    service = module.get<TransunionService>(TransunionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
