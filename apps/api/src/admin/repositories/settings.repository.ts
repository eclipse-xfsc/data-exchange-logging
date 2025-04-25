import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { BaseDatabaseRepository } from '../../common/repositories/base-db.repository';
import { Setting, SETTINGS_NAME } from '../entities/setting.entity';

@Injectable()
export class SettingsRepository extends BaseDatabaseRepository<Setting> {
  public constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    @InjectRepository(Setting) repository: Repository<Setting>
  ) {
    super(cache, repository);
  }

  public findSetting<S extends SETTINGS_NAME>(
    name: S
  ): Promise<Setting<S> | null> {
    return this.repository.findOne({ where: { name } });
  }
}
