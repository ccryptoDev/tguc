import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../../entities/user.entity';

@Entity({ name: 'transunion_history' })
export class TransUnionHistory {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  requestData: Record<string, any>;

  @Column({ type: 'jsonb' })
  responseData: Record<string, any>;

  @Column({ default: 0 })
  status: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;
}
