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

import { User } from '../../entities/user.entity';
import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { TransUnion } from '../../underwriting/transunion/entities/transunion.entity';

export type OfferData = {
  adjWeightMax: number;
  downPayment: number;
  dtiMax: number;
  dtiMin: number;
  ficoMax: number;
  ficoMin: number;
  financedAmount: number;
  fundingSource: string;
  grade: string;
  loanAmount: number;
  loanId: number;
  maxLoanAmt: number;
  minLoanAmt: number;
  paymentFrequency: string;
  apr: number;
  decimalAmount: number;
  financeCharge: number;
  fullNumberAmount: number;
  interestRate: number;
  monthlyPayment: number;
  postDTI: number;
  term: number;
  totalLoanAmount: number;
  promoApr: number;
  promoDecimalAmount: number;
  promoFinanceCharge: number;
  promoFullNumberAmount: number;
  promoInterestRate: number;
  promoMonthlyPayment: number;
  promoPostDTI: number;
  promoTerm: number;
  promoTotalLoanAmount: number;
  canUsePromo: boolean;
  promoSelected: boolean;
};

export type RulesDetails = {
  approvedRuleMsg: Record<string, any>[];
  declinedRuleMsg: Record<string, any>[];
  ruleData: Record<string, any>[];
  loanApproved: boolean;
  totalAdjWeight: number;
};

@Entity()
export class ScreenTracking {
  @Column({ type: 'double precision', nullable: true })
  adjRulesWeight: number;

  @Column()
  applicationReference: string;

  @Column({ type: 'double precision', nullable: true })
  approvedUpTo: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  creditScore: number;

  @Column({ type: 'jsonb', nullable: true })
  declineReasons: Record<string, any>[];

  @Column({ nullable: true })
  deniedMessage: string;

  @Column({ type: 'double precision', nullable: true })
  incomeAmount: number; // monthly salary

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isBackendApplication: boolean;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isMil: boolean;

  @Column({ default: false })
  isNoHit: boolean;

  @Column({ default: false })
  isOfac: boolean;

  @Column({
    type: 'enum',
    enum: [
      'apply',
      'denied',
      'offers',
      'sign-contract',
      'repayment',
      'document-upload',
      'waiting-approval',
      'contract-signed',
    ],
  })
  lastLevel:
    | 'apply'
    | 'denied'
    | 'offers'
    | 'sign-contract'
    | 'repayment'
    | 'document-upload'
    | 'waiting-approval'
    | 'contract-signed';

  @Column({
    default: 'address-information',
    type: 'enum',
    enum: [
      'address-information',
      'document-upload',
      'contract-signed',
      'connect-bank',
      'waiting-for-approve',
      'select-offer',
      'payment-details',
      'sign-contract',
      'social-security-number',
      'thank-you',
      'declined',
    ],
  })
  lastScreen:
    | 'address-information'
    | 'document-upload'
    | 'contract-signed'
    | 'connect-bank'
    | 'waiting-for-approve'
    | 'select-offer'
    | 'payment-details'
    | 'sign-contract'
    | 'social-security-number'
    | 'thank-you'
    | 'declined';

  @Column({ nullable: true })
  lockCreditTier: string;

  @Column({ default: false })
  lockToLowestTier: boolean;

  @Column({ type: 'double precision', nullable: true })
  requestedAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  offerData: OfferData;

  @Column({ type: 'jsonb', nullable: true })
  offers: Record<string, any>[];

  @ManyToOne(() => PracticeManagement)
  @JoinColumn({ name: 'practiceManagementId' })
  practiceManagement: string | PracticeManagement;

  @Column({ type: 'double precision', nullable: true })
  preDTIMonthlyAmount: number;

  @Column({ type: 'double precision', nullable: true })
  preDTIPercentValue: number;

  @Column({ type: 'jsonb', nullable: true })
  rulesDetails: RulesDetails;

  @Column({ default: false })
  skipAutoPay: boolean;

  @Column()
  source: string;

  @OneToOne(() => TransUnion)
  @JoinColumn({ name: 'transunionId' })
  transUnion: string | TransUnion;

  @ManyToOne(() => User, (user) => user.screenTracking)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @Column({ nullable: true })
  product: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedIncomeAmount: number; // monthly salary

  @Column({ default: false })
  isContractor: boolean;

  @Column({ default: false })
  isAwaitingWorkCompletion: boolean;

  @Column({ type: 'double precision', nullable: true })
  DTI: number;

  @Column({ type: 'double precision', nullable: true })
  PTI: number;

  @Column({ type: 'double precision', nullable: true })
  DTIPercent: number;

  @Column({ type: 'double precision', nullable: true })
  PTIPercent: number;

  @Column({ type: 'double precision', nullable: true })
  TotalGMI: number;

  @Column({ type: 'double precision', nullable: true })
  disposableIncome: number;

  @Column({ type: 'double precision', nullable: true })
  maxAmountApproved: number;
}
