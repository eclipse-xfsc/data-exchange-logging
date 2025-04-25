import React from 'react';
import Button from '../../form/button';

export interface RightToolbarTemplateProps {
  exportCSV?: () => void;
}

const RightToolbarTemplate: React.FC<RightToolbarTemplateProps> = ({
  exportCSV,
}) => {
  if (!exportCSV) {
    return null;
  }
  return (
    <React.Fragment>
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help"
        onClick={exportCSV}
      />
    </React.Fragment>
  );
};

export default RightToolbarTemplate;
