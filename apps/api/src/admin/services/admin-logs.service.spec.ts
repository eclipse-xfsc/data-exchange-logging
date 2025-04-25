import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test } from '@nestjs/testing';

import { InboxNotificationRepository } from '../../inbox/repository/inbox-notifications.repository';
import { AdminLogService, LogDynamicInterval } from './admin-logs.service';

const getCount = jest.fn();
const getLogDynamics = jest.fn();
const paginate = jest.fn();
const getJobCountByTypes = jest.fn();
const mockedQueue = {
  getJobCountByTypes,
};

describe('AdminLogService', () => {
  let service: AdminLogService;
  const doSetup = async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          prefix: `${process.pid}`,
          name: 'notifications',
          redis: {
            host: 'localhost',
            port: 6379,
          },
        }),
      ],
      providers: [
        AdminLogService,
        {
          provide: InboxNotificationRepository,
          useFactory: () => ({
            getCount,
            getLogDynamics,
            paginate,
          }),
        },
      ],
    })
      .overrideProvider(getQueueToken('notifications'))
      .useValue(mockedQueue)
      .compile();

    service = moduleRef.get<AdminLogService>(AdminLogService);
  };

  describe('getOverview', () => {
    beforeAll(async () => {
      await doSetup();
      getCount.mockResolvedValue(1);
      getJobCountByTypes.mockResolvedValue({});
    });
    it('get overview correctly', async () => {
      const result = await service.getOverview();
      expect(getCount).toBeCalled();
      expect(getJobCountByTypes).toBeCalledWith([
        'active',
        'delayed',
        'paused',
        'waiting',
      ]);
      expect(result).toEqual({
        count: 1,
        inQueue: {},
      });
    });
  });

  describe('getLogsDynamics', () => {
    beforeAll(async () => {
      await doSetup();
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(2022, 3, 1));
      getLogDynamics.mockResolvedValue({});
    });

    beforeEach(() => {
      getLogDynamics.mockReset();
    });
    it('getLogsDynamics daily', async () => {
      await service.getLogsDynamics(LogDynamicInterval.DAY);
      console.log('test', getLogDynamics.mock.calls[0][1].toISOString());
      expect(getLogDynamics).toBeCalledTimes(1);
      expect(getLogDynamics.mock.calls[0][0]).toEqual('hour');
      expect(getLogDynamics.mock.calls[0][1].toISOString()).toEqual(
        '2022-03-31T21:00:00.000Z'
      );
    });

    it('getLogsDynamics weekly', async () => {
      await service.getLogsDynamics(LogDynamicInterval.WEEK);
      expect(getLogDynamics).toBeCalledTimes(1);
      expect(getLogDynamics.mock.calls[0][0]).toEqual('day');
      expect(getLogDynamics.mock.calls[0][1].toISOString()).toEqual(
        '2022-03-24T22:00:00.000Z'
      );
    });

    it('getLogsDynamics monthly', async () => {
      await service.getLogsDynamics(LogDynamicInterval.MONTH);
      expect(getLogDynamics).toBeCalledTimes(1);
      expect(getLogDynamics.mock.calls[0][0]).toEqual('day');
      expect(getLogDynamics.mock.calls[0][1].toISOString()).toEqual(
        '2022-02-28T22:00:00.000Z'
      );
    });
  });
});
