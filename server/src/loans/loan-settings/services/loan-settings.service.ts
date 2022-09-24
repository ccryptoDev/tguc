import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanSettings } from '../entities/loan-settings.entity';

@Injectable()
export class LoanSettingsService {
  constructor(
    @InjectRepository(LoanSettings)
    private readonly loanSettingsModel: Repository<LoanSettings>,
  ) {}

  async getLoanSettings(): Promise<LoanSettings | null> {
    const loanSettings = await this.loanSettingsModel.findOne({});

    return loanSettings;
  }

  async updateLateFee(lateFee: number): Promise<LoanSettings | null> {
    await this.loanSettingsModel.update({}, { lateFee: lateFee });
    const updatedLoanSettings = await this.loanSettingsModel.findOne({});

    return updatedLoanSettings;
  }

  async updateNSFFee(NSFFee: number): Promise<LoanSettings | null> {
    await this.loanSettingsModel.update({}, { nsfFee: NSFFee });
    const updatedLoanSettings = await this.loanSettingsModel.findOne({});

    return updatedLoanSettings;
  }

  async updateLateFeeGracePeriod(
    lateFeeGracePeriod: number,
  ): Promise<LoanSettings | null> {
    await this.loanSettingsModel.update(
      {},
      { lateFeeGracePeriod: lateFeeGracePeriod },
    );
    const updatedLoanSettings = await this.loanSettingsModel.findOne({});

    return updatedLoanSettings;
  }

  async updateDelinquencyPeriod(
    delinquencyPeriod: number,
  ): Promise<LoanSettings | null> {
    await this.loanSettingsModel.update(
      {},
      { delinquencyPeriod: delinquencyPeriod },
    );
    const updatedLoanSettings = await this.loanSettingsModel.findOne({});

    return updatedLoanSettings;
  }
}
