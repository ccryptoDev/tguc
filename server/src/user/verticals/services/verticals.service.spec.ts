import { Test, TestingModule } from '@nestjs/testing';
import { VerticalsService } from './verticals.service';

describe('VerticalsService', () => {
  let service: VerticalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerticalsService],
    }).compile();

    service = module.get<VerticalsService>(VerticalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
