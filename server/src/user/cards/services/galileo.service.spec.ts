import { Test, TestingModule } from '@nestjs/testing';
import { GalileoService } from './galileo.service';

describe('GalileoService', () => {
  let service: GalileoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GalileoService],
    }).compile();

    service = module.get<GalileoService>(GalileoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
