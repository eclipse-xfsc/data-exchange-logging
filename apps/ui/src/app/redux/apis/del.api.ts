import { createApi } from '@reduxjs/toolkit/query/react';
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';
import { RootState } from '../store';
import {
  AuthToken,
  DBBackupDTO,
  ErrorResponse,
  ValidationErrorResponse,
} from '@dels/common';
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { setAuthToken } from '../slices/auth.slice';
import qs from 'querystring';
import { APP_ENDPOINT } from '../../constants';

export type ChartInterval = 'day' | 'week' | 'month';

export interface NotificationLog {
  id: string;
  updatedAt: Date;
  createdAt: Date;
  description: string;
  contract: string;
  receiver: string;
  sender: string;
  type: string;
  proof: string;
  verifiedAt?: any;
}

export interface Pagination<T> {
  items: T[];
  count: number;
}

export interface PagingParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  searchTerm?: string;
}

const delBaseQuery = fetchBaseQuery({
  baseUrl: APP_ENDPOINT,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token.accessToken}`);
    }
    return headers;
  },
});

const delQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ErrorResponse | ValidationErrorResponse
> = async (args, api, extraOptions) => {
  let result = await delBaseQuery(args, api, extraOptions);
  if (result.error) {
    if (
      result.error.status === 401 &&
      (args as FetchArgs).url !== '/auth/login'
    ) {
      api.dispatch(setAuthToken());
    }
    return {
      ...result,
      error: result.error.data,
    } as QueryReturnValue<
      unknown,
      ErrorResponse | ValidationErrorResponse,
      FetchBaseQueryMeta
    >;
  }
  return result as QueryReturnValue<
    unknown,
    ErrorResponse | ValidationErrorResponse,
    FetchBaseQueryMeta
  >;
};

export const isValidationErrorResponse = (
  response: any
): response is ValidationErrorResponse => {
  return response.error === 'Bad Request' && Array.isArray(response.message);
};

export const isServerErrorResponse = (
  response: any
): response is ErrorResponse => {
  return (
    parseInt(response.statusCode) >= 400 && typeof response.message === 'string'
  );
};

export type AppSettings = {
  SETTING_LOG_RETENTION_PERIOD_DAYS: number;
  SETTING_LOG_PRUNING_CRON: string;
  SETTING_LOG_INTEGRITY_CRON: string;
};

export const delApiSlice = createApi({
  reducerPath: 'del/api',

  baseQuery: delQuery,
  tagTypes: ['Settings', 'IntegrityCheckOverview', 'LogsDynamics', 'Logs'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthToken, { username: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logOut: builder.mutation<unknown, unknown>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    listSettings: builder.query<AppSettings, undefined>({
      query: () => ({
        url: '/settings',
        method: 'GET',
      }),
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<AppSettings, AppSettings>({
      query: (settings) => ({
        url: '/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Settings', 'IntegrityCheckOverview'],
    }),
    integrityCheckOverview: builder.query<Integrity.Overview, undefined>({
      query: () => ({
        url: '/log-integrity',
        method: 'GET',
      }),
      providesTags: ['IntegrityCheckOverview'],
    }),
    pauseIntegrityCheck: builder.mutation<boolean, boolean>({
      query: (start: boolean) => ({
        url: `/log-integrity/${start}`,
        method: 'PUT',
      }),
      invalidatesTags: ['IntegrityCheckOverview'],
    }),
    startIntegrityCheck: builder.mutation<unknown, unknown>({
      query: () => ({
        url: '/log-integrity/start',
        method: 'POST',
      }),
      invalidatesTags: ['IntegrityCheckOverview'],
    }),
    logsOverview: builder.query<{ count: number; inQueue: number }, unknown>({
      query: () => ({
        url: '/logs/overview',
        method: 'GET',
      }),
    }),
    logsDynamics: builder.query<
      Array<{ count: number; time: string; type: string }>,
      ChartInterval
    >({
      query: (interval) => ({
        url: `/logs/dynamics/${interval}`,
        method: 'GET',
      }),
      providesTags: ['LogsDynamics'],
    }),
    logs: builder.query<Pagination<NotificationLog>, PagingParams>({
      query: (args) => ({
        url: `/logs?${qs.stringify(args as any)}`,
        method: 'GET',
      }),
      providesTags: ['Logs'],
    }),
    verifyLog: builder.mutation<NotificationLog, string>({
      query: (logId) => ({
        url: `/log-integrity/verify/${logId}`,
        method: 'POST',
      }),
      invalidatesTags: ['IntegrityCheckOverview'],
    }),
    dbConfig: builder.query<DBBackupDTO, undefined>({
      query: (args) => ({
        url: `/backups`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useListSettingsQuery,
  useUpdateSettingsMutation,
  useIntegrityCheckOverviewQuery,
  usePauseIntegrityCheckMutation,
  useLogOutMutation,
  useStartIntegrityCheckMutation,
  useLogsOverviewQuery,
  useLogsDynamicsQuery,
  useLogsQuery,
  useVerifyLogMutation,
  useDbConfigQuery,
} = delApiSlice;
