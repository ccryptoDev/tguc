import { Test, TestingModule } from '@nestjs/testing';
import { TransunionController } from './transunion.controller';

describe('TransunionController', () => {
  let controller: TransunionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransunionController],
    }).compile();

    controller = module.get<TransunionController>(TransunionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
