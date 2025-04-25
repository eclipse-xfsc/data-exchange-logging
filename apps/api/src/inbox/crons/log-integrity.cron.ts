import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import * as moment from 'moment';
import { SETTINGS_NAME } from '../../admin/entities/setting.entity';
import { SettingsService } from '../../admin/services/settings.service';
import { BaseCron } from '../../common/cron/base.cron';
import { OnEvent } from '../../common/decorators/on-event.decorator';
import { GLOBAL_CRON_QUEUE } from '../../global/global.module';
import { InboxNotificationsIntegrityProcessor } from '../services/inbox-notification-integrity.processor';

const JOB_NAME = 'LogIntegrityCron';
@Processor(GLOBAL_CRON_QUEUE)
@Injectable()
export class LogIntegrityCron extends BaseCron {
  constructor(
    @InjectQueue(GLOBAL_CRON_QUEUE) queue: Queue,
    settingsService: SettingsService,
    private readonly logger: Logger,
    private readonly integrityProcessor: InboxNotificationsIntegrityProcessor
  ) {
    queue.on('global:failed', async (jobId: string, error: string) => {
      const job = await queue.getJob(jobId);
      if (job.name === JOB_NAME && job.attemptsMade <= 3) {
        job.retry();
      }
    });
    super(queue, async () => {
      const cron = (
        await settingsService.getSetting(
          SETTINGS_NAME.SETTING_LOG_INTEGRITY_CRON
        )
      ).value;
      return {
        jobId: `log-intregity-cron`,
        repeat: {
          cron,
        },
      };
    });
  }

  @Process(JOB_NAME)
  async run(job: Job) {
    try {
      if (!(await this.integrityProcessor.isRunning())) {
        await this.integrityProcessor.addJob(true);
        this.logger.log(`CRON:${JOB_NAME}, ${moment().utc().format()}`);
      }
      console.log('success runnign job', JSON.stringify(job));
    } catch (e: any) {
      console.log('error running job', JSON.stringify(job), e);
      if (e.message !== 'There is already a job in the queue') {
        await job.moveToFailed({
          message: e.message,
        });
      }
    }
  }

  protected getJobName(): string {
    return JOB_NAME;
  }

  @OnEvent(`SETTING.SETTING_LOG_INTEGRITY_CRON.updated`, { async: true })
  async refreshJob() {
    return super.refreshJob();
  }
}
