declare module Integrity {
  export interface Data {
    skipVerified: boolean;
    page: number;
    pageSize: number;
    skip: number;
    processed: number;
    total: number;
  }

  export interface LastJob {
    id: string;
    data: Data;
    processedOn: number;
    finishedOn: number;
  }

  export interface Cron {
    next: number;
    expression: string;
  }

  export interface Overview {
    count: number;
    lastJob?: LastJob;
    isRunning: boolean;
    isPaused: boolean;
    cron?: Cron;
  }
}
