import cx from 'classnames';
import {
  addDays,
  differenceInDays,
  format,
  subMonths,
  subWeeks,
} from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { groupBy } from 'lodash';
import { Chart } from 'primereact/chart';
import { ProgressSpinner } from 'primereact/progressspinner';
import React from 'react';
import { ChartInterval, useLogsDynamicsQuery } from '../../redux/apis/del.api';
import Button from '../form/button';
import styles from './log-dynamics.module.scss';

type LogRow = {
  count: number;
  time: string;
  type: string;
};

const getChartData = (data: Array<LogRow>, type: ChartInterval) => {
  let labels: string[] = [];
  let dates: Date[] = [];
  const currentTime = zonedTimeToUtc(
    new Date(),
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  let finder = (date: Date) => (row: LogRow) =>
    new Date(row.time).getTime() === date.getTime();
  switch (type) {
    case 'day': {
      dates = new Array(new Date().getHours() + 1).fill(0).map((e, hours) => {
        const date = new Date();
        date.setHours(hours, 0, 0, 0);
        return date;
      });
      labels = dates.map((date) => format(date, 'HH:mm'));
      break;
    }
    case 'week':
    case 'month': {
      finder = (date: Date) => (row: LogRow) => {
        const rowDate = new Date(row.time);
        return (
          rowDate.getDate() === date.getDate() &&
          rowDate.getMonth() === date.getMonth()
        );
      };

      const diff =
        type === 'week' ? subWeeks(currentTime, 1) : subMonths(currentTime, 1);
      dates = new Array(differenceInDays(currentTime, diff) + 2)
        .fill(diff)
        .map((date: Date, i, a) => {
          date = addDays(date, i);
          date.setHours(0, 0, 0, 0);
          date.setUTCHours(0, 0, 0, 0);
          return date;
        });
      labels = dates.map((date) => format(date, 'dd MMMM yyyy'));
    }
  }
  const groupedByType = groupBy(data, 'type');
  const datasets = Object.entries(groupedByType).map(([type, logs]) => {
    const data = dates.map((date) => logs.find(finder(date))?.count ?? 0);
    return {
      label: `${type} Logs`,
      backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      data,
    };
  });
  return {
    labels,
    datasets,
  };
};

const barOptions = {
  plugins: {
    legend: {
      labels: {
        color: '#495057',
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#495057',
      },
      grid: {
        color: '#ebedef',
      },
    },
    y: {
      ticks: {
        color: '#495057',
      },
      grid: {
        color: '#ebedef',
      },
    },
  },
};

interface LogsDynamicChartProps {}

const LogsDynamicChart: React.FC<LogsDynamicChartProps> = ({}) => {
  const [chartInterval, setChartInterval] =
    React.useState<ChartInterval>('day');
  const {
    data: chartData,
    isLoading: isChartDataLoading,
    isFetching: isChartDataFetching,
  } = useLogsDynamicsQuery(chartInterval);

  return (
    <div className="card relative">
      <h5>Activity</h5>
      <div className="flex justify-content-center flex-wrap ">
        <span className="p-buttonset align-self-center">
          <Button
            label="Today"
            icon="pi pi-calendar-times"
            onClick={() => setChartInterval('day')}
          />
          <Button
            label="This week"
            icon="pi pi-calendar"
            onClick={() => setChartInterval('week')}
          />
          <Button
            label="This month"
            icon="pi pi-calendar-plus"
            onClick={() => setChartInterval('month')}
          />
        </span>
      </div>
      {(isChartDataFetching || isChartDataLoading) && (
        <ProgressSpinner className={cx('absolute', styles.spinner)} />
      )}
      <Chart
        type="bar"
        data={getChartData(chartData ?? [], chartInterval)}
        options={barOptions}
      />
    </div>
  );
};

export default LogsDynamicChart;
