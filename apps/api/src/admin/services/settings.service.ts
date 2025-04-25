import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../config/config.module';
import { EventEmitter } from '../../global/events/event-emitter';
import { SETTINGS_NAME } from '../entities/setting.entity';
import { SettingsRepository } from '../repositories/settings.repository';

@Injectable()
export class SettingsService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly configService: ConfigService<ConfigType>,
    private readonly eventEmmiter: EventEmitter
  ) {}

  public async seed() {
    const settings = this.configService.get('settings', { infer: true });
    await Promise.all(
      Object.entries(settings).map(
        async ([name, value]: [SETTINGS_NAME, any]) => {
          const setting = await this.getSetting(name);
          if (!setting) {
            await this.repository.save({
              name,
              value: value,
            });
          }
        }
      )
    );
  }

  public getSetting<S extends SETTINGS_NAME>(name: S) {
    return this.repository.findSetting(name);
  }

  public list() {
    return this.repository.list();
  }

  public updateSettings(settings: Record<SETTINGS_NAME, any>) {
    return Promise.all(
      Object.entries(settings).map(
        async ([name, value]: [SETTINGS_NAME, any]) => {
          let setting = await this.getSetting(name);
          setting = await this.repository.save({
            id: setting?.id,
            name,
            value,
          });
          switch (name) {
            case SETTINGS_NAME.SETTING_LOG_PRUNING_CRON:
            case SETTINGS_NAME.SETTING_LOG_INTEGRITY_CRON: {
              this.eventEmmiter.emit(`SETTING.${name}.updated`, setting);
              break;
            }
          }
          return setting;
        }
      )
    );
  }
}
