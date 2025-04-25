import React from 'react';
import { format as formatFn } from 'date-fns';

interface DateCellTemplateProps {
  date: string;
  format?: string;
}

const DateCellTemplate: React.FC<DateCellTemplateProps> = ({
  date,
  format = 'dd/MM/yyyy HH:mm:ss',
}) => {
  if (!date) {
    return null;
  }
  return <div>{formatFn(new Date(date), format)}</div>;
};

export default DateCellTemplate;
