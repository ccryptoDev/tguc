import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PaymentManagement } from '../payment-management/payment-management.entity';
import { PracticeManagement } from '../../../admin/dashboard/practice-management/entities/practice-management.entity';
import { User } from '../../../user/entities/user.entity';

@Entity()
export class Payment {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'double precision' })
  amount: number;

  @ManyToOne(() => PaymentManagement)
  @JoinColumn({ name: 'paymentManagementId' })
  paymentManagement: string | PaymentManagement;

  @Column()
  paymentReference: string;

  @ManyToOne(() => PracticeManagement)
  @JoinColumn({ name: 'practiceManagementId' })
  practiceManagement: string | PracticeManagement;

  @Column({
    type: 'enum',
    enum: ['pending', 'declined', 'returned', 'paid'],
  })
  status: 'pending' | 'declined' | 'returned' | 'paid';

  @Column({ type: 'enum', enum: ['debit card'] })
  type: 'debit card';

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @Column({ type: 'enum', enum: ['loanpaymentpro'] })
  vendor: 'loanpaymentpro';

  @Column({ nullable: true })
  transactionMessage: string;

  @Column({ nullable: true })
  transId: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
