import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/model/base.entity';

export enum SETTINGS_NAME {
  SETTING_LOG_RETENTION_PERIOD_DAYS = 'SETTING_LOG_RETENTION_PERIOD_DAYS',
  SETTING_LOG_PRUNING_CRON = 'SETTING_LOG_PRUNING_CRON',
  SETTING_LOG_INTEGRITY_CRON = 'SETTING_LOG_INTEGRITY_CRON',
}

export type SettingValueType<S extends SETTINGS_NAME> =
  S extends SETTINGS_NAME.SETTING_LOG_RETENTION_PERIOD_DAYS ? number : string;

@Entity({
  name: 'settings',
})
export class Setting<S extends SETTINGS_NAME = any> extends BaseEntity {
  @Index()
  @Column({
    unique: true,
    type: 'enum',
    enum: SETTINGS_NAME,
  })
  name: SETTINGS_NAME;

  @Column({
    type: 'json',
  })
  value: SettingValueType<S>;
}
