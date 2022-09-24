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

@Entity({ name: 'experian' })
export class Experian {

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  creditCollection: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  employment: Record<string, any>[];

  @Column()
  firstName: string;

  @Column({ type: 'jsonb', nullable: true })
  houseNumber: Record<string, any>[];

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  inquiry: Record<string, any>[];

  @Column({ default: false })
  isNoHit: boolean;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ type: 'jsonb', nullable: true })
  publicRecord: Record<string, any>[];

  @Column({ nullable: true })
  score: string;

  @Column()
  socialSecurity: string;

  @Column({ default: 0 })
  status: number;

  @Column({ type: 'jsonb', nullable: true })
  trade: Record<string, any>[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
