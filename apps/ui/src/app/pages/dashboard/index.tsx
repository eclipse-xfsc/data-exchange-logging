import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BasicCard } from '../../components/dashboard-card';
import { useIntegrityCheck } from '../../hooks/use-integrity-check';
import relativeDate from 'tiny-relative-date';
import {
  useDbConfigQuery,
  useLogsOverviewQuery,
} from '../../redux/apis/del.api';
import LogsDynamicChart from '../../components/logs-dynamic-chart';
import cronstrue from 'cronstrue';
import { APP_ENDPOINT } from '../../constants';

const DashboardPage = () => {
  const {
    overview,
    pauseQueue,
    resumeQueue,
    isUpdatingQueue,
    startIntegrityCheck,
    progress,
    ...integrityLoadable
  } = useIntegrityCheck();

  const {
    data: logsOverview,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
  } = useLogsOverviewQuery(undefined);

  const {
    data: dbBackup,
    isLoading: isDbConfigLoaing,
    isFetching: isDbConfigFetching,
  } = useDbConfigQuery(undefined);

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div className="grid">
        <BasicCard
          isLoading={isLogsLoading}
          isFetching={isLogsFetching}
          title="Transaction Logs"
          value={logsOverview?.count ?? 0}
          icon="pi-inbox"
          subsets={[
            {
              value: logsOverview?.inQueue ?? 0,
              title: 'in queue',
            },
          ]}
        />
        <BasicCard
          title="Backups"
          value={dbBackup?.count ?? '-'}
          icon="pi-server"
          subsets={[
            { value: dbBackup?.size },
            {
              title: dbBackup
                ? cronstrue.toString(dbBackup.cron, { verbose: true })
                : '-',
            },
          ]}
        />
        <BasicCard
          {...integrityLoadable}
          title="Transaction logs integrity check"
          value={overview?.count ?? 0}
          icon="pi-briefcase"
          subsets={[
            {
              title: '(last executed)',
              value: overview?.lastJob?.finishedOn
                ? relativeDate(overview?.lastJob?.finishedOn)
                : '-',
            },
            {
              title: '(next)',
              value: overview?.cron?.next
                ? relativeDate(overview?.cron?.next)
                : '-',
            },
          ]}
          className="col-12 lg:col-6 xl:col-6"
          actions={{
            label: overview?.isPaused
              ? 'Paused'
              : overview?.isRunning
              ? 'Running'
              : 'Idle',
            loading: isUpdatingQueue || overview?.isRunning,
            progress: overview?.isRunning ? progress : undefined,
            items: [
              {
                label: 'Start',
                icon: 'pi pi-play',
                disabled: overview?.isRunning || overview?.isPaused,
                command: startIntegrityCheck,
              },
              {
                label: 'Resume Queue',
                icon: 'pi pi-play',
                disabled: !overview?.isPaused,
                command: resumeQueue,
              },
              {
                label: 'Pause Queue',
                icon: 'pi pi-pause',
                disabled: overview?.isPaused,
                command: pauseQueue,
              },
              {
                separator: true,
              },
              {
                label: 'More Details',
                icon: 'pi pi-external-link',
                url: `${APP_ENDPOINT}/bull-monitor`,
              },
            ],
          }}
        />
        <div className="col-12 lg:col-12">
          <LogsDynamicChart />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
