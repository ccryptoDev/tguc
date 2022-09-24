import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Agreement {
  @Column()
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  documentKey: string;

  @Column()
  documentName: string;

  @Column()
  documentPath: string;

  @Column()
  documentVersion: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
