import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { CamReportingService } from './cam-reporting.service';

@Processor('{cam-report-queue}')
@Injectable()
export class CamRepotingProcessor {
  constructor(private readonly camService: CamReportingService) {}

  @Process()
  async process(job: Job<{ id: string }>) {
    const { id } = job.data;
    await this.camService.reportTamperedLog(id);
  }
}
