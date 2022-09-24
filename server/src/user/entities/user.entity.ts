import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { State } from './state.entity';
import { PracticeManagement } from '../../admin/dashboard/practice-management/entities/practice-management.entity';
import { ScreenTracking } from '../screen-tracking/entities/screen-tracking.entity';
import { Roles } from '../../authentication/roles/entities/roles.entity';
import { Admin } from 'src/admin/entities/admin.entity';
@Entity()
export class User {
  @ManyToOne(() => State)
  @JoinColumn({ name: 'stateId' })
  _state: string | State;

  @Column({ nullable: true })
  city: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  customerUpdateToken: string;

  @Column({ nullable: true })
  customerUpdateTokenExpires: Date;

  @Column()
  dateOfBirth: Date;

  @Column({ nullable: true })
  driversLicenseNumber: string;

  @Column({ nullable: true })
  driversLicenseState: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isBackendApplication: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isExistingLoan: boolean;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  password: string;

  @Column({ type: 'jsonb' })
  phones: { phone: string; type: 'mobile' | 'home' | 'office' }[];

  @ManyToOne(() => PracticeManagement)
  @JoinColumn({ name: 'practiceManagementId' })
  practiceManagement: string | PracticeManagement;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordTokenExpires: Date;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'roleId' })
  role: string | Roles;

  @OneToOne(() => ScreenTracking, (screenTracking) => screenTracking.user)
  screenTracking: string | ScreenTracking;

  @Column()
  ssnNumber: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  unitApt: string;

  @Column()
  userReference: string;

  @Column({ nullable: true })
  updatedSsn: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  passwordRaw: string;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'referredById' })
  referredBy?: string | Admin;

  @Column({ type: 'double precision', nullable: true })
  requestedAmount: number;
}
