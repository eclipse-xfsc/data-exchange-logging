import React from 'react';
import { APP_ENDPOINT } from '../constants';
import {
  delApiSlice,
  useIntegrityCheckOverviewQuery,
  usePauseIntegrityCheckMutation,
  useStartIntegrityCheckMutation,
} from '../redux/apis/del.api';
import { useDispatch } from '../redux/store';

export const useIntegrityCheck = () => {
  const {
    data: overview,
    isUninitialized,
    refetch,
    isFetching,
    isLoading,
  } = useIntegrityCheckOverviewQuery(undefined);
  const [_pauseQueue, { error, isLoading: isUpdatingQueue }] =
    usePauseIntegrityCheckMutation();
  const [startIntegrityCheck] = useStartIntegrityCheckMutation();
  const [progress, setProgress] = React.useState(0);
  const dispatch = useDispatch();

  React.useEffect(() => {
    let eventSource = new EventSource(
      `${APP_ENDPOINT}/log-integrity/progress`,
      {
        withCredentials: true,
      }
    );
    eventSource.onmessage = ({ data }) => {
      data = JSON.parse(data);
      setProgress(Math.round((data.processed / data.total) * 100));
      if (!overview?.isRunning) {
        refetch();
      }
      dispatch(delApiSlice.util.invalidateTags(['Logs']));
    };
    return () => {
      eventSource.close();
    };
  }, [overview]);

  React.useEffect(() => {
    if (isUninitialized) {
      refetch();
    }
    if (overview?.lastJob) {
      setProgress(
        Math.round(
          (overview.lastJob.data.processed / overview.lastJob.data.total) * 100
        )
      );
    }
  }, [overview, isUninitialized]);

  React.useEffect(() => {
    if (progress >= 100) {
      refetch();
      setProgress(0);
    }
  }, [progress]);

  const resumeQueue = () => _pauseQueue(false);
  const pauseQueue = () => _pauseQueue(true);

  return {
    overview,
    isFetching,
    isLoading,
    isUpdatingQueue,
    progress,
    resumeQueue,
    pauseQueue,
    startIntegrityCheck,
  };
};
