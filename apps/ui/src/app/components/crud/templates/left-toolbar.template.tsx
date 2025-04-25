import React from 'react';
import Button from '../../form/button';

export interface LeftToolbarTemplateProps {
  openNew?: () => void;
  onDelete?: () => void;
  selectedRows?: any[];
}

const LeftToolbarTemplate: React.FC<LeftToolbarTemplateProps> = ({
  openNew,
  onDelete,
  selectedRows,
}) => {
  if (!openNew && !onDelete) {
    return null;
  }
  return (
    <React.Fragment>
      <div className="my-2">
        {openNew && (
          <Button
            label="New"
            icon="pi pi-plus"
            className="p-button-success mr-2"
            onClick={openNew}
          />
        )}
        {onDelete && (
          <Button
            label="Delete"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={onDelete}
            disabled={!selectedRows || !selectedRows.length}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default LeftToolbarTemplate;
