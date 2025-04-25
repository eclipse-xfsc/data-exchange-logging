import { BadRequestException } from '@nestjs/common';
import { Job, JobOptions, Queue } from 'bull';

export abstract class BaseCron {
  constructor(
    protected queue: Queue,
    protected optionsGetter: () => Promise<JobOptions>
  ) {
    this.addJob();
  }

  protected abstract getJobName(): string;
  protected abstract run(job: Job): Promise<void>;

  public async refreshJob() {
    const job = await this.getJob();
    await this.queue.removeRepeatableByKey(job.key);
    return this.addJob();
  }

  public async getJob() {
    return (await this.queue.getRepeatableJobs()).find(
      (job) => job.name === this.getJobName()
    );
  }

  public async getCronInformation() {
    const job = await this.getJob();
    if (!job) {
      throw new BadRequestException('No job found');
    }
    return {
      next: job.next,
      expression: job.cron,
    };
  }

  protected async addJob() {
    const options = await this.optionsGetter();
    return this.queue.add(
      this.getJobName(),
      {},
      {
        ...options,
      }
    );
  }
}
