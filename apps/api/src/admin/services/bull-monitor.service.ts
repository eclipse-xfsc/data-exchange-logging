import { BullMonitorExpress } from '@bull-monitor/express';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BullAdapter } from '@bull-monitor/root/dist/bull-adapter';

@Injectable()
export class BullMonitorService extends BullMonitorExpress {
  constructor(
    @InjectQueue('{integrity-queue}') integrityQueue: Queue,
    @InjectQueue('{notifications}') notificationsQueue: Queue,
    @InjectQueue('{cam-report-queue}') camQueue: Queue,
    @InjectQueue('{webhook-queue}') webHookQueue: Queue
  ) {
    super({
      queues: [
        new BullAdapter(integrityQueue),
        new BullAdapter(webHookQueue),
        new BullAdapter(notificationsQueue, { readonly: true }),
        new BullAdapter(camQueue, { readonly: true }),
      ],
    });
  }
}
