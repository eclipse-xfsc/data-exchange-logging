import { Test } from '@nestjs/testing';
import { EntityNotFoundError } from 'typeorm';
import { InboxNotificationRepository } from '../repository/inbox-notifications.repository';
import { InboxNotificationsService } from './inbox-notifications.service';

const getEntity = jest.fn();
const save = jest.fn();
const listIds = jest.fn();
const deleteBy = jest.fn();

const notificationDTO = {
  '@context': {},
  contract: 'test-contract',
  description: 'test-description',
  receiver: 'test-receiver',
  sender: 'test-sender',
  type: 'test-type',
};
const notificationEntity = {
  '@context': {},
  contract: 'test-contract',
  description: 'test-description',
  id: 'test-id',
  receiver: 'test-receiver',
  sender: 'test-sender',
  type: 'test-type',
};

describe('Inbox notifications Service', () => {
  let service: InboxNotificationsService;
  const doSetup = async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InboxNotificationsService,
        {
          provide: InboxNotificationRepository,
          useFactory: () => ({
            save,
            getEntity,
            listIds,
            deleteBy,
          }),
        },
      ],
    }).compile();

    service = moduleRef.get<InboxNotificationsService>(
      InboxNotificationsService
    );
  };

  describe('fetches the notification', () => {
    beforeAll(async () => {
      await doSetup();
      getEntity
        .mockResolvedValueOnce({})
        .mockRejectedValue(new EntityNotFoundError({} as any, {}));
    });

    it('retrieves the notification', async () => {
      const notification = await service.get(
        {
          'gax-dcs:logID': '21165349-e0b7-4661-afaf-4a9ebfdc0deb',
          'gax-dcs:dataTransactionID': '123',
          'gax-dcs:contractID': 'http://example.org/data-asset-1',
          iss: '(Logging service ID)',
          sub: 'The receiver id 123',
          aud: '(GX-DELS identifier)',
          exp: 1661256412,
        },
        'notification-id'
      );
      expect(notification).toBeTruthy();
    });

    it('throws 404 if entity not found', () => {
      expect(
        service.get(
          {
            'gax-dcs:logID': '21165349-e0b7-4661-afaf-4a9ebfdc0deb',
            'gax-dcs:dataTransactionID': '123',
            'gax-dcs:contractID': 'http://example.org/data-asset-1',
            iss: '(Logging service ID)',
            sub: 'The receiver id 123',
            aud: '(GX-DELS identifier)',
            exp: 1661256412,
          },
          'notification-id'
        )
      ).rejects.toThrowError();
    });
  });

  describe('creates the notification', () => {
    beforeAll(async () => {
      await doSetup();
    });

    it('creates a notification', async () => {
      await service.create('test-id', notificationDTO);
      expect(save).toBeCalledWith(notificationEntity);
    });
  });

  describe('lists notifications ids', () => {
    beforeAll(async () => {
      await doSetup();
      listIds.mockResolvedValue([{ id: '1' }, { id: '2' }]);
    });

    it('creates a notification', async () => {
      const ids = await service.listIds(
        {
          'gax-dcs:logID': '21165349-e0b7-4661-afaf-4a9ebfdc0deb',
          'gax-dcs:dataTransactionID': '123',
          'gax-dcs:contractID': 'http://example.org/data-asset-1',
          iss: '(Logging service ID)',
          sub: 'The receiver id 123',
          aud: '(GX-DELS identifier)',
          exp: 1661256412,
        },
        {}
      );
      expect(ids).toEqual(['1', '2']);
    });
  });

  describe('delete notifications by period', () => {
    beforeAll(async () => {
      await doSetup();
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(2020, 3, 1));
      deleteBy.mockResolvedValue({ affected: 5 });
    });

    it('delete notifications by period', async () => {
      const result = await service.deleteOldLogs(1);
      expect(result).toEqual(5);
      expect(deleteBy).toBeCalled();
    });
  });
});
