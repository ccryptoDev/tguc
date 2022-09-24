import { Test, TestingModule } from '@nestjs/testing';
import { GalileoController } from './galileo.controller';

describe('GalileoController', () => {
  let controller: GalileoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GalileoController],
    }).compile();

    controller = module.get<GalileoController>(GalileoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
