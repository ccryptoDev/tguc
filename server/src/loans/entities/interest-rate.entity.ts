import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class LoanInterestRate {
  @Column()
  adjWeightMax: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'double precision' })
  downPayment: number;

  @Column({ type: 'double precision' })
  dtiMax: number;

  @Column({ type: 'double precision' })
  dtiMin: number;

  @Column()
  ficoMax: number;

  @Column()
  ficoMin: number;

  @Column()
  grade: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'double precision' })
  interestRate: number;

  @Column({ type: 'double precision', nullable: true })
  loanAmount: number;

  @Column({ type: 'double precision' })
  maxLoanAmount: number;

  @Column({ type: 'double precision' })
  minLoanAmount: number;

  @Column({ type: 'double precision' })
  promoInterestRate: number;

  @Column()
  promoTerm: number;

  @Column()
  stateCode: string;

  @Column()
  term: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
