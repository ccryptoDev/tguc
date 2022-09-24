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

@Entity()
export class Card {
  @Column()
  accountNumber: string;

  @Column({ type: 'double precision', default: 0.0 })
  balance: number;

  @Column()
  cardNumber: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  expiryDate: string;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: false })
  isFrozen: boolean;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  responseBody: Record<string, any>;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: ScreenTracking | string;
}
