import { Admin } from '../../../admin/entities/admin.entity';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Vertical {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'contractorId' })
  contractor: string | Admin;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
