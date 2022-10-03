import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../../entities/user.entity';
import { ScreenTracking } from "../../../screen-tracking/entities/screen-tracking.entity";

@Entity({ name: 'instntdata' })
export class Instnt {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  formData: Record<string, any>;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @OneToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: string | ScreenTracking;

  @Column()
  formKey: string;

  @Column()
  decision: string;

  @Column()
  transactionId: string;

  @Column({ nullable: true })
  status: number;

  @Column()
  instntJwt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
