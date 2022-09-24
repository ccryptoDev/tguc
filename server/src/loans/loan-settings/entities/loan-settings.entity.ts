import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class LoanSettings {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  delinquencyPeriod: number;

  @Column()
  lateFee: number;

  @Column()
  lateFeeGracePeriod: number;

  @Column()
  nsfFee: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
