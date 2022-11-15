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
  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  routingNumber: string;

  @Column({ nullable: true })
  financialInstitution: string;

  @Column({ nullable: true })
  manualPayment: boolean;

  @Column({ nullable: true })
  accountType: string;

  @Column({ type: 'double precision', default: 0.0 })
  balance: number;

  @Column({ nullable: true })
  cardNumber: string;

  @Column({ nullable: true })
  cardName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  expiryDate: string;

  @Column({ nullable: true })
  securityCode: string;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: false })
  isFrozen: boolean;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true})
  responseBody: Record<string, any>;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: ScreenTracking | string;

  @Column({ nullable: true })
  billingAddress1: string;

  @Column({ nullable: true })
  billingAddress2: string;

  @Column({ nullable: true })
  billingCity: string;

  @Column({ nullable: true })
  billingFirstName: string;

  @Column({ nullable: true })
  billingLastName: string;

  @Column({ nullable: true })
  billingState: string;

  @Column({ nullable: true })
  billingZip: string;
}
