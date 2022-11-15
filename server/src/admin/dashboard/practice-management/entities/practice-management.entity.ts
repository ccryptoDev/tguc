import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PracticeManagement {
  @Column({ default: "" })
  address: string;

  @Column({ default: "" })
  city: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: "" })
  contactName: string;

  @Column({ default: "" })
  email: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: "" })
  location: string;

  @Column({ default: "" })
  phone: string;

  @Column({ default: "" })
  practiceName: string;

  @Column({ default: "" })
  stateCode: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ default: "" })
  url: string;

  @Column({ default: "" })
  zip: string;

  @Column({ nullable: true, default: 0 })
  yearsInBusiness: number;

  @Column({ nullable: true, default: 0 })
  tin: string;

  @Column({ type: 'double precision', nullable: true })
  annualRevenue: number;
}
