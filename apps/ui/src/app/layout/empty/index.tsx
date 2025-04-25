import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './empty-layout.module.scss';
import cx from 'classnames';

interface EmptyLayout {
  children?: React.ReactNode;
}

export const EmptyLayout: React.FunctionComponent<EmptyLayout> = ({}) => {
  return (
    <div className="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
      <div
        className={cx('grid justify-content-center p-2 lg:p-0', styles.inner)}
      >
        <div className="col-12 mt-5 xl:mt-0 text-center"></div>
        <div className={cx('col-12 xl:col-6', styles.wrapper)}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
