import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { IPaymentScheduleItem } from './payment-schedule-item.interface';
import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { User } from '../../../user/entities/user.entity';

@Entity()
export class PaymentManagement {
  @Column({ type: 'double precision', nullable: true })
  apr: number;

  @Column({ default: false })
  canRunAutomaticPayment: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'double precision', nullable: true })
  currentPaymentAmount: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  initialPaymentSchedule: IPaymentScheduleItem[];

  @Column({ type: 'double precision', nullable: true })
  interestApplied: number;

  @Column({ nullable: true })
  loanReference: string;

  @Column({ nullable: true })
  loanStartDate: Date;

  @Column({ nullable: true })
  loanTermCount: number;

  @Column({ nullable: true })
  maturityDate: Date;

  @Column({ type: 'double precision', nullable: true })
  minimumPaymentAmount: number;

  @Column({ nullable: true })
  nextPaymentSchedule: Date;

  @Column({ type: 'jsonb', nullable: true })
  paymentSchedule: IPaymentScheduleItem[];

  @Column({ type: 'double precision', nullable: true })
  payOffAmount: number; // same as promo payoff during the promo term

  @ManyToOne(() => PracticeManagement)
  @JoinColumn({ name: 'practiceManagementId' })
  practiceManagement: string | PracticeManagement;

  @Column({ type: 'double precision', nullable: true })
  principalAmount: number;

  @Column({ type: 'double precision', nullable: true })
  promoPaymentAmount: number;

  @Column({ default: false })
  promoSelected: boolean;

  @Column({ type: 'enum', enum: ['available', 'unavailable'], nullable: true })
  promoStatus: 'available' | 'unavailable';

  @Column({ nullable: true })
  promoTermCount: number;

  @OneToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: string | ScreenTracking;

  @Column({
    type: 'enum',
    enum: [
      'approved',
      'denied',
      'expired',
      'in-repayment non-prime',
      'in-repayment prime',
      'in-repayment delinquent1',
      'in-repayment delinquent2',
      'in-repayment delinquent3',
      'in-repayment delinquent4',
      'paid',
      'pending',
      'closed',
      'funded',
      'qualified',
      'non-qualified',
      'pending-disbursement',
    ],
  })
  status:
    | 'approved'
    | 'denied'
    | 'expired'
    | 'in-repayment non-prime'
    | 'in-repayment prime'
    | 'in-repayment delinquent1'
    | 'in-repayment delinquent2'
    | 'in-repayment delinquent3'
    | 'in-repayment delinquent4'
    | 'paid'
    | 'pending'
    | 'closed'
    | 'funded'
    | 'qualified'
    | 'non-qualified'
    | 'pending-disbursement';

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
