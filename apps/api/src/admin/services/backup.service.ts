import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFiles } from '../../common/utils';
import { ConfigType } from '../../config/config.module';
import * as fs from 'fs';
import * as filesize from 'filesize';

@Injectable()
export class BackupsService {
  constructor(private readonly configService: ConfigService<ConfigType>) {}

  public async getBackupInformation() {
    const { backupLocation, backupCron } = this.configService.get('admin', {
      infer: true,
    });
    const files = await getFiles(backupLocation);
    const dumps = files.filter((file) => file.endsWith('.dmp'));
    const size = dumps.reduce((acc, file) => acc + fs.statSync(file).size, 0);
    return {
      count: dumps.length,
      size: filesize(size),
      cron: backupCron,
    };
  }
}
