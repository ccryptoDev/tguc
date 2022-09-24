import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScreenTracking } from '../../screen-tracking/entities/screen-tracking.entity';
import { Card } from './card.entity';

@Entity()
export class Transactions {
  @Column()
  amount: string;

  @Column()
  authenticationId: string;

  @ManyToOne(() => Card)
  @JoinColumn({ name: 'cardId' })
  card: Card | string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  postingTimestamp: Date;

  @Column({ type: 'double precision' })
  remainingBalance: number;

  @Column({ type: 'jsonb' })
  responseBody: Record<string, any>;

  @Column()
  status: string;

  @Column()
  transactionDescription: string;

  @Column({ type: 'timestamptz' })
  transactionTimestamp: Date;

  @Column()
  transactionType: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: ScreenTracking | string;
}
