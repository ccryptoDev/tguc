import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../entities/user.entity';
import { PaymentManagement } from '../../../loans/payments/payment-management/payment-management.entity';
import { ScreenTracking } from '../../screen-tracking/entities/screen-tracking.entity';
import { Agreement } from '../../../loans/entities/agreement.entity';

@Entity()
export class UserConsent {
  @Column({ nullable: true })
  agreementDocumentPath: string;

  @ManyToOne(() => Agreement)
  @JoinColumn({ name: 'agreementId' })
  agreement: string | Agreement;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  documentKey: string;

  @Column()
  documentName: string;

  @Column()
  documentVersion: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column({ default: 1 })
  loanUpdated: number;

  @ManyToOne(() => PaymentManagement)
  @JoinColumn({ name: 'paymentManagementId' })
  paymentManagement: string | PaymentManagement;

  @ManyToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: string | ScreenTracking;

  @Column()
  signedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
