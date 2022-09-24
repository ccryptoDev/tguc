import { Test, TestingModule } from '@nestjs/testing';
import { LoanpaymentproController } from './loanpaymentpro.controller';

describe('LoanpaymentproController', () => {
  let controller: LoanpaymentproController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanpaymentproController],
    }).compile();

    controller = module.get<LoanpaymentproController>(LoanpaymentproController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
