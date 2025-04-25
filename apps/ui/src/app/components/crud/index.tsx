import classNames from 'classnames';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Rating } from 'primereact/rating';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import React from 'react';
import DefaultLeftToolbarTemplate, {
  LeftToolbarTemplateProps,
} from './templates/left-toolbar.template';
import DefaultRightToolbarTemplate, {
  RightToolbarTemplateProps,
} from './templates/right-toolbar.template';
import { throttle } from 'lodash';

interface CrudCrudDataTableProps<T> extends DataTableProps {
  value: T[];
  emptyItem?: T;
  headerTitle?: string;
  itemName?: string;
  saveItem?: (item: T) => Promise<any>;
  deleteItem?: (item: T | T[]) => Promise<any>;
  LeftToolbarTemplate?: React.FC<LeftToolbarTemplateProps>;
  RightToolbarTemplate?: React.FC<RightToolbarTemplateProps>;
  search?: string;
  onSearch?: (search: string) => void;
  columns: ColumnProps[];
  ViewItemTemplate?: React.ComponentType<T>;
  createable?: boolean;
  actions?: Array<React.ComponentType<T>>;
}

const CrudDataTable = <T extends object>({
  value,
  headerTitle,
  emptyItem,
  saveItem,
  itemName,
  deleteItem,
  LeftToolbarTemplate,
  RightToolbarTemplate,
  ViewItemTemplate,
  columns,
  createable,
  onSearch,
  search,
  actions,
  ...dataTableProps
}: CrudCrudDataTableProps<T>) => {
  const [itemDialog, setItemDialog] = React.useState(false);
  const [item, setItem] = React.useState(emptyItem);
  const [deleteItemDialog, setDeleteItemDialog] = React.useState(false);
  const [deleteItemsDialog, setDeleteItemsDialog] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<T[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const toast = React.useRef<Toast>(null);
  const dt = React.useRef<DataTable>(null);

  const openNew = () => {
    setItem(emptyItem);
    setSubmitted(false);
    setItemDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setItemDialog(false);
  };

  const hideDeleteProductDialog = () => {
    setDeleteItemDialog(false);
  };

  const hideDeleteProductsDialog = () => {
    setDeleteItemsDialog(false);
  };

  const _saveItem = async () => {
    if (!item || !saveItem) {
      return;
    }
    setSubmitted(true);
    try {
      await saveItem(item);
      toast.current?.show({
        severity: 'success',
        summary: 'Successful',
        detail: `${itemName} Updated`,
        life: 3000,
      });
    } catch (e: any) {
      toast.current?.show({
        severity: 'error',
        summary: `${itemName} not created`,
        detail: e.message,
        life: 3000,
      });
    } finally {
      setItemDialog(false);
      setItem(emptyItem);
    }
  };

  const editProduct = (item: T) => {
    setItem({ ...item });
    setItemDialog(true);
  };

  const confirmDeleteProduct = (item: T) => {
    setItem(item);
    setDeleteItemDialog(true);
  };

  const _deleteItem = async () => {
    if (!item || !deleteItem) {
      return;
    }
    try {
      await deleteItem(item);
      toast.current?.show({
        severity: 'success',
        summary: 'Successful',
        detail: `${itemName} Deleted`,
        life: 3000,
      });
    } catch (e: any) {
      toast.current?.show({
        severity: 'error',
        summary: `${itemName} Not Deleted`,
        detail: e.message,
        life: 3000,
      });
    } finally {
      setDeleteItemDialog(false);
      setItem(emptyItem);
    }
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmDeleteSelected = () => {
    setDeleteItemsDialog(true);
  };

  const deleteSelectedItems = async () => {
    if (!selectedItems.length || !deleteItem) {
      return;
    }
    try {
      await deleteItem(selectedItems);
      toast.current?.show({
        severity: 'success',
        summary: 'Successful',
        detail: `${itemName}s Deleted`,
        life: 3000,
      });
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `${itemName}s Not Deleted`,
        life: 3000,
      });
    } finally {
      setDeleteItemsDialog(false);
      setSelectedItems([]);
    }
  };

  const leftToolbarTemplate = () => {
    if (!LeftToolbarTemplate) {
      return (
        <DefaultLeftToolbarTemplate
          openNew={saveItem && openNew}
          onDelete={deleteItem && confirmDeleteSelected}
          selectedRows={selectedItems}
        />
      );
    } else {
      return (
        <LeftToolbarTemplate
          openNew={openNew}
          onDelete={confirmDeleteSelected}
          selectedRows={selectedItems}
        />
      );
    }
  };

  const rightToolbarTemplate = () => {
    if (!RightToolbarTemplate) {
      return <DefaultRightToolbarTemplate exportCSV={exportCSV} />;
    } else {
      return <RightToolbarTemplate exportCSV={exportCSV} />;
    }
  };

  const actionBodyTemplate = (rowData: T) => {
    return (
      <div className="actions">
        {ViewItemTemplate && (
          <Button
            icon="pi pi-eye"
            className="p-button-rounded p-button-success mr-2"
            onClick={() => editProduct(rowData)}
          />
        )}
        {saveItem && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-success mr-2"
            onClick={() => editProduct(rowData)}
          />
        )}
        {deleteItem && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-warning mt-2"
            onClick={() => confirmDeleteProduct(rowData)}
          />
        )}
        {actions &&
          actions.map((Action, index) => (
            <Action key={(rowData as any).id} {...rowData} />
          ))}
      </div>
    );
  };

  const _onSearch = React.useCallback(
    throttle(
      (search: string) => {
        if (onSearch) {
          onSearch(search);
        }
      },
      500,
      { leading: false }
    ),
    [onSearch]
  );

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">{headerTitle}</h5>
      {onSearch && (
        <span className="block mt-2 md:mt-0 p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            onInput={(e) => _onSearch((e.target as any).value)}
            placeholder="Search..."
          />
        </span>
      )}
    </div>
  );

  const productDialogFooter = (
    <>
      {saveItem && (
        <>
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={hideDialog}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            className="p-button-text"
            onClick={_saveItem}
          />
        </>
      )}
      {ViewItemTemplate && (
        <Button
          label="Ok"
          icon="pi pi-times"
          className="p-button-text"
          onClick={hideDialog}
        />
      )}
    </>
  );
  const deleteProductDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteProductDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={_deleteItem}
      />
    </>
  );
  const deleteProductsDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteProductsDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteSelectedItems}
      />
    </>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar
            className="mb-4"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          ></Toolbar>

          <DataTable
            {...dataTableProps}
            value={value}
            ref={dt}
            selection={selectedItems}
            onSelectionChange={(e) => setSelectedItems(e.value)}
            dataKey="id"
            paginator
            rows={dataTableProps.rows ?? 10}
            rowsPerPageOptions={
              dataTableProps.rowsPerPageOptions ?? [5, 10, 25]
            }
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${(
              itemName ?? 'item'
            ).toLowerCase()}s`}
            emptyMessage={
              dataTableProps.emptyMessage ?? `No ${itemName}s found.`
            }
            header={header}
            responsiveLayout="scroll"
          >
            {columns.map((columnProps) => {
              return <Column key={columnProps.field} {...columnProps}></Column>;
            })}
            <Column body={actionBodyTemplate}></Column>
          </DataTable>

          <Dialog
            visible={itemDialog}
            style={{ width: '450px' }}
            header={`${itemName} Details`}
            modal
            className="p-fluid"
            footer={productDialogFooter}
            onHide={hideDialog}
          >
            {ViewItemTemplate && item && <ViewItemTemplate {...item} />}
          </Dialog>

          <Dialog
            visible={deleteItemDialog}
            style={{ width: '450px' }}
            header="Confirm"
            modal
            footer={deleteProductDialogFooter}
            onHide={hideDeleteProductDialog}
          >
            <div className="flex align-items-center justify-content-center">
              <i
                className="pi pi-exclamation-triangle mr-3"
                style={{ fontSize: '2rem' }}
              />
              {item && (
                <span>
                  Are you sure you want to delete <b>{itemName}</b>?
                </span>
              )}
            </div>
          </Dialog>

          <Dialog
            visible={deleteItemsDialog}
            style={{ width: '450px' }}
            header="Confirm"
            modal
            footer={deleteProductsDialogFooter}
            onHide={hideDeleteProductsDialog}
          >
            <div className="flex align-items-center justify-content-center">
              <i
                className="pi pi-exclamation-triangle mr-3"
                style={{ fontSize: '2rem' }}
              />
              {item && (
                <span>
                  Are you sure you want to delete the selected {itemName}s?
                </span>
              )}
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CrudDataTable;
