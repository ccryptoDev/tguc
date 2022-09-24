import { Test, TestingModule } from '@nestjs/testing';
import { VerticalsController } from './verticals.controller';

describe('VerticalsController', () => {
  let controller: VerticalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerticalsController],
    }).compile();

    controller = module.get<VerticalsController>(VerticalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
