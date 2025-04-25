import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../common/model/base.entity';
import { Method } from 'axios';

export enum WebHookStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity()
@Unique('webhook_config', ['url', 'method'])
export class WebHook extends BaseEntity {
  @Column()
  @Index()
  contractId: string;

  @Column({
    type: 'enum',
    enum: WebHookStatus,
  })
  status: WebHookStatus;

  @Column()
  url: string;

  @Column({
    type: 'varchar',
  })
  method: Method;

  @Column()
  participantId: string;

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  headers?: any;
}
