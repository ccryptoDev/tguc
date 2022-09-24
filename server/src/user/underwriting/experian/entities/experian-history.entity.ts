import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToOne,
    JoinColumn, ManyToOne,
} from 'typeorm';

import { User } from '../../../entities/user.entity';
import {ScreenTracking} from "../../../screen-tracking/entities/screen-tracking.entity";

@Entity({ name: 'experian_history' })
export class ExperianHistory {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  requestData: Record<string, any>;

  @Column({ type: 'jsonb' })
  responseData: Record<string, any>;

  @Column({ type: 'jsonb' })
  report: Record<string, any>;

  @Column({ default: 0 })
  status: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @ManyToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: ScreenTracking | string;
}
