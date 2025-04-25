import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/model/base.entity';

@Entity()
export class InboxNotification extends BaseEntity {
  @Column()
  id: string;

  @Column()
  description: string;

  @Column()
  contract: string;

  @Column()
  receiver: string;

  @Column()
  sender: string;

  @Column({ name: 'context', nullable: true, type: 'jsonb' })
  '@context': any;

  @Column()
  type: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verifiedAt: Date;

  @Column({
    type: 'varchar',
  })
  verifiableCrendetial: string;
}
