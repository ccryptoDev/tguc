import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PracticeManagement } from '../dashboard/practice-management/entities/practice-management.entity';
import { Roles } from '../../authentication/roles/entities/roles.entity';

@Entity({ name: 'admin_user' })
export class Admin {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  email: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isDeleted: boolean;

  @Column()
  password?: string;

  @Column()
  phoneNumber: string;

  @ManyToOne((): typeof PracticeManagement => PracticeManagement)
  @JoinColumn({ name: 'practiceManagementId' })
  practiceManagement: string | PracticeManagement;

  @ManyToOne((): typeof Roles => Roles)
  @JoinColumn({ name: 'roleId' })
  role: string | Roles;

  @Column()
  userName: string;

  @ManyToOne((): typeof Admin => Admin)
  @JoinColumn({ name: 'contactorId' })
  contractor?: Admin;

  @Column({ nullable: true })
  userReference: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  zipcodeAndRadius: {};

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  offers: {};
}
