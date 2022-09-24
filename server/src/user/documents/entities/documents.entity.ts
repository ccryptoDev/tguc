import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Roles } from '../../../authentication/roles/entities/roles.entity';
import { User } from '../../entities/user.entity';

@Entity()
export class UserDocuments {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  driversLicense: { front: string; back: string };

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  passport: string;

  @Column({ nullable: true })
  document: string;

  @Column({ nullable: true })
  type: string;

  @Column()
  uploaderId: string;

  @Column()
  uploaderName: string;

  @Column({
    type: 'enum',
    enum: ['Manager', 'Super Admin', 'User', 'Merchant Staff'],
  })
  uploaderRole: Roles['roleName'];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'denied'],
    nullable: true,
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'denied';

  @Column({ nullable: true })
  reason: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: string | User;
}
