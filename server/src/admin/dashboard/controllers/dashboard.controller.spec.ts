import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: AdminDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
    }).compile();

    controller = module.get<AdminDashboardController>(AdminDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
