import { User } from 'src/user/entities/user.entity';
import { ScreenTracking } from 'src/user/screen-tracking/entities/screen-tracking.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Account {
  @Column({ type: 'jsonb', nullable: true })
  accounts?: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  creditRiskAttributes?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  incomeAttributes?: Record<string, any>;

  @Column()
  institution: string;

  @Column()
  loginId: string;

  @Column({ type: 'jsonb', nullable: true })
  userAnalysisAttributes?: Record<string, any>;

  @OneToOne(() => ScreenTracking)
  @JoinColumn({ name: 'screenTrackingId' })
  screenTracking: string | ScreenTracking;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;
}
