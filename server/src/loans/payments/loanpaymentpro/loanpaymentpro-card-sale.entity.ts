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

import { User } from '../../../user/entities/user.entity';
import { LoanPaymentProCardToken } from './loanpaymentpro-card-token.entity';
import { Payment } from '../entities/payment.entity';

@Entity({ name: 'loanpaymentpro_card_sale' })
export class LoanPaymentProCardSale {
  @Column({ nullable: true })
  authCode: string;

  @ManyToOne(() => LoanPaymentProCardToken)
  @JoinColumn({ name: 'cardTokenId' })
  cardToken: string | LoanPaymentProCardToken;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  message: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'paymentId' })
  payment: string | Payment;

  @Column({ type: 'jsonb' })
  paymentRequest: Record<string, any>;

  @Column({ type: 'jsonb' })
  paymentResponse: Record<string, any>;

  @Column({ nullable: true })
  responseCode: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  transactionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
