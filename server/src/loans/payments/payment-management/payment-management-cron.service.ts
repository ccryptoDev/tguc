import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';

import { LoggerService } from '../../../logger/services/logger.service';
import { LoanSettingsService } from '../../loan-settings/services/loan-settings.service';
import { PaymentManagement } from './payment-management.entity';
import { IPaymentScheduleItem } from './payment-schedule-item.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';

@Injectable()
export class PaymentManagementCronService {
  constructor(
    @InjectRepository(PaymentManagement)
    private readonly PaymentManagementModel: Repository<PaymentManagement>,
    private readonly logger: LoggerService,
    private readonly loanSettingsService: LoanSettingsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkPromoAvailability() {
    this.logger.log(
      'Running promo availability cron',
      `${PaymentManagementCronService.name}#checkPromoAvailability`,
    );
    try {
      const paymentManagements: PaymentManagement[] =
        await this.PaymentManagementModel.find({ promoStatus: 'available' });
      if (!paymentManagements || paymentManagements.length <= 0) {
        this.logger.log(
          'No payment management with available promo found',
          `${PaymentManagementCronService.name}#checkPromoAvailability`,
        );
      }

      for (const paymentManagement of paymentManagements) {
        try {
          if (
            moment()
              .startOf('day')
              .isAfter(
                moment(paymentManagement.loanStartDate)
                  .add(paymentManagement.promoTermCount, 'months')
                  .startOf('day'),
              )
          ) {
            this.logger.log(
              `Setting promoStatus to unavailable for PaymentManagement id ${paymentManagement.id} `,
              `${PaymentManagementCronService.name}#checkPromoAvailability`,
            );
            await this.PaymentManagementModel.update(
              {
                id: paymentManagement.id,
              },
              { promoStatus: 'unavailable' },
            );
            this.logger.log(
              `promoStatus set to unavailable for paymentManagement id ${paymentManagement.id} `,
              `${PaymentManagementCronService.name}#checkPromoAvailability`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Could not update promoStatus for PaymentManagement id ${paymentManagement.id}`,
            `${PaymentManagementCronService.name}#checkPromoAvailability`,
            undefined,
            error,
          );
        }
      }
      this.logger.log(
        'Ran promo availability cron',
        `${PaymentManagementCronService.name}#checkPromoAvailability`,
      );
    } catch (error) {
      this.logger.error(
        'Error',
        `${PaymentManagementCronService.name}#checkPromoAvailability`,
        undefined,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredApplications() {
    this.logger.log(
      'Running expired applications cron',
      `${PaymentManagementCronService.name}#checkExpiredApplications`,
    );
    const expirationLimit = moment()
      .subtract(45, 'days')
      .startOf('day')
      .toDate();

    try {
      const { affected } = await this.PaymentManagementModel.update(
        {
          createdAt: LessThanOrEqual(expirationLimit),
          status: In(['approved', 'denied', 'pending']),
        },
        {
          status: 'expired',
        },
      );
      this.logger.log(
        `Set ${affected} application(s) as expired`,
        `${PaymentManagementCronService.name}#checkExpiredApplications`,
      );
      this.logger.log(
        'Expired applications cron ran',
        `${PaymentManagementCronService.name}#checkExpiredApplications`,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentManagementCronService.name}#checkExpiredApplications`,
        undefined,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async delinquencyCron() {
    this.logger.log(
      'Running delinquency cron',
      `${PaymentManagementCronService.name}#delinquencyCron`,
    );
    let paymentManagementId = '';

    const loanSettings = await this.loanSettingsService.getLoanSettings();
    const today: Date = moment().startOf('day').toDate();
    const lateFeeThreshold: Date = moment(today)
      .subtract(loanSettings.lateFeeGracePeriod, 'day')
      .startOf('day')
      .toDate();

    try {
      // check for payments due today
      const paymentManagements: PaymentManagement[] | null =
        await this.PaymentManagementModel.find({
          where: {
            id: '60fe53bfd9619f18eb4712fb',
            status: In([
              'in-repayment prime',
              'in-repayment non-prime',
              'in-repayment delinquent1',
              'in-repayment delinquent2',
              'in-repayment delinquent3',
              'in-repayment delinquent4',
            ]),
          },
          relations: ['screenTracking'],
        });
      if (!paymentManagements || paymentManagements.length <= 0) {
        this.logger.log(
          'No active loans found',
          `${PaymentManagementCronService.name}#delinquencyCron`,
        );
        return;
      }

      for (const paymentManagement of paymentManagements) {
        try {
          paymentManagementId = paymentManagement.id;
          const screenTracking: ScreenTracking =
            paymentManagement.screenTracking as ScreenTracking;
          // find next available payment schedule items that  before today's date
          const paymentScheduleItems: IPaymentScheduleItem[] =
            paymentManagement.paymentSchedule.filter(
              (scheduleItem) =>
                moment(scheduleItem.date).startOf('day').isBefore(today) &&
                scheduleItem.status === 'opened',
            );

          // If there is no late payments in the schedule
          if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
            await this.PaymentManagementModel.update(
              { id: paymentManagement.id },
              {
                status:
                  screenTracking.offerData.downPayment == 0
                    ? 'in-repayment prime'
                    : 'in-repayment non-prime',
              },
            );
            continue;
          } else {
            const furthestLatePayment = paymentScheduleItems[0];
            const updateStatus: PaymentManagement['status'] =
              await this.determineDelinquentTier(
                moment(today).diff(furthestLatePayment.date, 'day'),
              );
            await this.PaymentManagementModel.update(
              { id: paymentManagement.id },
              {
                status: updateStatus,
              },
            );
          }

          this.logger.log(
            `Processing delinquency status for payment management id ${paymentManagementId}`,
            `${PaymentManagementCronService.name}#delinquencyCron`,
          );

          for (const paymentScheduleItem of paymentScheduleItems) {
            if (
              moment(paymentScheduleItem.date)
                .startOf('day')
                .isSameOrBefore(lateFeeThreshold)
            ) {
              if (paymentScheduleItem.fees == 0) {
                paymentScheduleItem.fees += loanSettings.lateFee;
              }
            }

            const updatedPaymentManagement = {
              paymentSchedule: paymentManagement.paymentSchedule,
            };

            await this.PaymentManagementModel.update(
              { id: paymentManagement.id },
              updatedPaymentManagement,
            );
            this.logger.log(
              `Loan with id ${paymentManagementId} marked delinquent.`,
              `${PaymentManagementCronService.name}#delinquencyCron`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Could not process automatic payment for payment management id ${paymentManagementId}`,
            `${PaymentManagementCronService.name}#delinquencyCron`,
            undefined,
            error,
          );
        }
      }
      this.logger.log(
        'Ran delinquency cron',
        `${PaymentManagementCronService.name}#delinquencyCron`,
      );
    } catch (error) {
      this.logger.log(
        `Internal server error`,
        `${PaymentManagementCronService.name}#delinquencyCron`,
        undefined,
        error,
      );
    }
  }

  async determineDelinquentTier(
    days: number,
  ): Promise<PaymentManagement['status']> {
    if (days < 30) {
      return 'in-repayment delinquent1';
    } else if (days < 60) {
      return 'in-repayment delinquent2';
    } else if (days < 90) {
      return 'in-repayment delinquent3';
    } else {
      return 'in-repayment delinquent4';
    }
  }
}
