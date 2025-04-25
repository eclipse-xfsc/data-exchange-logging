import { Toast } from 'primereact/toast';
import React, { RefObject } from 'react';

export const ToastContext = React.createContext<RefObject<Toast> | null>(null);

export const useToast = () => {
  const toast = React.useContext(ToastContext);
  return toast?.current;
};
