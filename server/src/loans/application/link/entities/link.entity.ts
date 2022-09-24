import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PracticeManagement } from '../../../../admin/dashboard/practice-management/entities/practice-management.entity';

@Entity()
export class ApplicationLink {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isBackendApplication: boolean;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  leadId?: string;

  @Column()
  phone: string;

  @ManyToOne(() => PracticeManagement)
  @JoinColumn({ name: 'practiceManagementId' })
  practiceManagement: string | PracticeManagement;

  @Column()
  source: 'lead-list' | 'web';

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
