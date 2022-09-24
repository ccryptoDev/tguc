import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity()
export class Plaid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @Column()
  access_token: string;

  @Column()
  public_token: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column({ type: 'jsonb', nullable: true })
  transactions: Record<string, any>[];

  @Column()
  totalRevenue: number;

  @Column()
  totalExpense: number;

  @Column()
  netIncome: number;

  @Column({ type: 'jsonb', nullable: true })
  accounts: Record<string, any>[];

  @Column({ nullable: true })
  assetReportToken: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
