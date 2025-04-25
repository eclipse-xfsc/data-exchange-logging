import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import * as moment from 'moment';
import { SETTINGS_NAME } from '../../admin/entities/setting.entity';
import { SettingsService } from '../../admin/services/settings.service';
import { BaseCron } from '../../common/cron/base.cron';
import { OnEvent } from '../../common/decorators/on-event.decorator';
import { GLOBAL_CRON_QUEUE } from '../../global/global.module';
import { InboxNotificationsService } from '../services/inbox-notifications.service';

const JOB_NAME = 'LogPruningJob';
@Processor(GLOBAL_CRON_QUEUE)
@Injectable()
export class LogPruningCron extends BaseCron {
  constructor(
    @InjectQueue(GLOBAL_CRON_QUEUE) queue: Queue,
    private settingsService: SettingsService,
    private readonly logger: Logger,
    private inboxNotificationService: InboxNotificationsService
  ) {
    queue.on('global:failed', async (jobId: string, error: string) => {
      const job = await queue.getJob(jobId);
      if (job.name === JOB_NAME && job.attemptsMade <= 3) {
        job.retry();
      }
    });
    super(queue, async () => {
      const cron = (
        await settingsService.getSetting(SETTINGS_NAME.SETTING_LOG_PRUNING_CRON)
      ).value;
      return {
        jobId: `log-prunning-job`,
        repeat: {
          cron,
        },
      };
    });
  }

  @Process(JOB_NAME)
  async run(job: Job) {
    try {
      const retentionPeriod = await this.settingsService.getSetting(
        SETTINGS_NAME.SETTING_LOG_RETENTION_PERIOD_DAYS
      );
      const deleted = await this.inboxNotificationService.deleteOldLogs(
        retentionPeriod.value
      );
      this.logger.log(
        `CRON:${JOB_NAME}, ${moment().utc().format()}, Deleted: ${deleted}`
      );
    } catch (e: any) {
      await job.moveToFailed({
        message: e.message,
      });
    }
  }

  protected getJobName(): string {
    return JOB_NAME;
  }

  @OnEvent(`SETTING.SETTING_LOG_PRUNING_CRON.updated`, { async: true })
  async refreshJob() {
    return super.refreshJob();
  }
}
