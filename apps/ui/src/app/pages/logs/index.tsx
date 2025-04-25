import { DataTablePFSEvent } from 'primereact/datatable';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import CrudDataTable from '../../components/crud';
import DateCellTemplate from '../../components/crud/templates/date-cell.template';
import {
  delApiSlice,
  NotificationLog,
  PagingParams,
  useLogsQuery,
  useVerifyLogMutation,
} from '../../redux/apis/del.api';
import { JSONTree } from 'react-json-tree';
import cx from 'classnames';
import Button from '../../components/form/button';
import { useDispatch } from '../../redux/store';
import { Toast } from 'primereact/toast';
import { useToast } from '../../hooks/use-toast';

export const LogsPage: React.FunctionComponent = () => {
  const [params, setParams] = React.useState<PagingParams>({
    page: 1,
    pageSize: 5,
  });
  const { data, isFetching, isLoading } = useLogsQuery(params);
  const [first, setFirst] = React.useState(0);
  const [
    verify,
    { error, isLoading: isVerifying, originalArgs: verifyingNotificationId },
  ] = useVerifyLogMutation();
  const dispatch = useDispatch();
  const toast = useToast();

  const onPage = (event: DataTablePFSEvent) => {
    setFirst(event.first);
    const sortParams: PagingParams = event.sortField
      ? {
          orderBy: event.sortField,
          orderDirection: event.sortOrder === 1 ? 'ASC' : 'DESC',
        }
      : {};
    setParams((params) => ({
      ...params,
      ...sortParams,
      page: (event.page ?? 0) + 1,
      pageSize: event.rows,
    }));
  };

  const onSearch = (searchTerm: string) => {
    setParams((params) => ({
      ...params,
      searchTerm,
    }));
  };

  const onVerify = React.useCallback(
    async (notificationId: string) => {
      const notification = await verify(notificationId).unwrap();
      dispatch(
        delApiSlice.util.updateQueryData('logs', params, (logs) => {
          const index = logs.items.findIndex((l) => l.id === notification.id);
          if (index >= 0) {
            logs.items[index] = notification;
          }
        })
      );
      if (notification.verifiedAt) {
        toast?.show({
          severity: 'success',
          summary: 'Verified',
          detail: `Verified ${notification.id}`,
          life: 3000,
        });
      } else {
        toast?.show({
          severity: 'warn',
          summary: 'Not verified',
          detail: `Error verifying ${notification.id}`,
          life: 5000,
        });
      }
    },
    [verify, dispatch, params, toast]
  );

  return (
    <>
      <Helmet>
        <title>Logs</title>
      </Helmet>

      <CrudDataTable
        value={data?.items || []}
        itemName="Transaction Log"
        first={first}
        onPage={onPage}
        onSort={onPage}
        sortField={params.orderBy}
        sortOrder={params.orderDirection === 'ASC' ? 1 : -1}
        lazy
        rows={params.pageSize}
        totalRecords={data?.count || 0}
        loading={isFetching || isLoading}
        onSearch={onSearch}
        ViewItemTemplate={(log) => (
          <JSONTree
            data={log}
            hideRoot
            theme={{
              scheme: 'monokai',
              base00: '#272822',
              base01: '#383830',
              base02: '#49483e',
              base03: '#75715e',
              base04: '#a59f85',
              base05: '#f8f8f2',
              base06: '#f5f4f1',
              base07: '#f9f8f5',
              base08: '#f92672',
              base09: '#fd971f',
              base0A: '#f4bf75',
              base0B: '#a6e22e',
              base0C: '#a1efe4',
              base0D: '#66d9ef',
              base0E: '#ae81ff',
              base0F: '#cc6633',
            }}
          />
        )}
        columns={[
          { field: 'id', header: 'ID' },
          { field: 'type', header: 'Type', sortable: true },
          { field: 'contract', header: 'Contract', sortable: true },
          { field: 'sender', header: 'Sender', sortable: true },
          { field: 'receiver', header: 'Receiver', sortable: true },
          {
            field: 'createdAt',
            header: 'Time',
            sortable: true,
            body: (rowData) => <DateCellTemplate date={rowData.createdAt} />,
          },
          {
            field: 'verifiedAt',
            header: 'Verified',
            sortable: true,
            body: (rowData) => <DateCellTemplate date={rowData.verifiedAt} />,
          },
        ]}
        actions={[
          (log) => (
            <Button
              icon="pi pi-sync"
              className="p-button-rounded p-button-warning mt-2"
              onClick={() => onVerify(log.id)}
              loading={isVerifying && log.id === verifyingNotificationId}
            />
          ),
        ]}
      />
    </>
  );
};
