import { Test } from '@nestjs/testing';
import { CamGateway } from '../gateways/cam.gateway';
import { InboxNotificationRepository } from '../repository/inbox-notifications.repository';
import { CamReportingService } from './cam-reporting.service';

const getEntity = jest.fn();
const reportTamperedLog = jest.fn();

const notificationEntity = {
  '@context': {},
  contract: 'test-contract',
  description: 'test-description',
  id: 'test-id',
  receiver: 'test-receiver',
  sender: 'test-sender',
  type: 'test-type',
};

describe('Cam Reporting Service', () => {
  let service: CamReportingService;
  const doSetup = async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CamReportingService,
        {
          provide: InboxNotificationRepository,
          useFactory: () => ({
            getEntity,
          }),
        },
        {
          provide: CamGateway,
          useFactory: () => ({
            reportTamperedLog,
          }),
        },
      ],
    }).compile();

    service = moduleRef.get<CamReportingService>(CamReportingService);
  };

  describe('reports tampered log', () => {
    beforeAll(async () => {
      await doSetup();
      getEntity.mockResolvedValue(notificationEntity);
    });

    it('reports tampered log correct', async () => {
      await service.reportTamperedLog('test-id');
      expect(reportTamperedLog).toBeCalledWith(notificationEntity);
    });
  });
});
