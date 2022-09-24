import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../../user/entities/user.entity';

@Entity({ name: 'loanpaymentpro_card_token' })
export class LoanPaymentProCardToken {
  @Column()
  billingAddress1: string;

  @Column({ nullable: true })
  billingAddress2: string;

  @Column()
  billingCity: string;

  @Column()
  billingFirstName: string;

  @Column()
  billingLastName: string;

  @Column()
  billingState: string;

  @Column()
  billingZip: string;

  @Column()
  cardCode: string;

  @Column()
  cardNumberLastFour: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  customerToken: string;

  @Column()
  expMonth: string;

  @Column()
  expYear: string;

  @Column()
  paymentMethodToken: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isDefault: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
