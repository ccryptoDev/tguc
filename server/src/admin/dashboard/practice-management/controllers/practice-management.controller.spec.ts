import { Test, TestingModule } from '@nestjs/testing';
import { PracticeManagementController } from './practice-management.controller';

describe('PracticeManagementController', () => {
  let controller: PracticeManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticeManagementController],
    }).compile();

    controller = module.get<PracticeManagementController>(
      PracticeManagementController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
