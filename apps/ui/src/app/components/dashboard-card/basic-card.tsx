import React from 'react';
import cx from 'classnames';
import styles from './dashboard-card.module.scss';
import { MenuItem } from '../app-sub-menu';
import { Menu } from 'primereact/menu';
import Button from '../form/button';
import { Skeleton } from 'primereact/skeleton';
import { withLoadable } from '../hocs/with-loadable';
import { ProgressBar } from 'primereact/progressbar';

interface BasicCardProps {
  title: string;
  value: string | number;
  icon?: string;
  subsets?: Array<{
    value?: string | number;
    title?: string;
    tooltip?: string;
  }>;
  className?: string;
  actions?: {
    label: string;
    loading?: boolean;
    progress?: number;
    items: Array<MenuItem | { separator: boolean }>;
  };
}

export const CardSkeleton = () => {
  return (
    <div className="field col-12 md:col-6 md:pr-6 pr-0">
      <div className="custom-skeleton p-4">
        <div className="flex mb-3 justify-content-between">
          <div>
            <Skeleton width="10rem" className="mb-2"></Skeleton>
            <Skeleton width="5rem" className="mb-2"></Skeleton>
          </div>
          <Skeleton size="2.5rem" className="mr-2"></Skeleton>
        </div>
        <div className="flex justify-content-between mt-3">
          <Skeleton width="4rem" height="2rem"></Skeleton>
        </div>
      </div>
    </div>
  );
};

export const BasicCard = React.forwardRef<HTMLDivElement, BasicCardProps>(
  (props, ref) => {
    const menu = React.useRef<Menu>(null);

    const toggleMenu = (event: any) => {
      menu.current?.toggle(event);
    };

    return (
      <div className={cx('col-12 lg:col-6 xl:col-3', props.className)}>
        <div className="card" ref={ref}>
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                {props.title}
              </span>
              <div className="text-900 font-medium text-xl">{props.value}</div>
            </div>
            {props.actions ? (
              <>
                <Menu ref={menu} model={props.actions.items} popup />
                {props.actions.loading &&
                props.actions.progress !== undefined ? (
                  <div className="col">
                    <ProgressBar value={props.actions.progress} />
                  </div>
                ) : (
                  <Button
                    type="button"
                    label={props.actions.label ?? 'Actions'}
                    loading={props.actions.loading}
                    disabled={props.actions.loading}
                    icon="pi pi-angle-down"
                    onClick={toggleMenu}
                    style={{ width: 'auto' }}
                  />
                )}
              </>
            ) : (
              props.icon && (
                <div
                  className={cx(
                    'flex align-items-center justify-content-center bg-cyan-100 border-round',
                    styles.iconBackground
                  )}
                >
                  <i className={cx('pi text-cyan-500 text-xl', props.icon)} />
                </div>
              )
            )}
          </div>
          {props.subsets &&
            props.subsets.map((subset) => (
              <div key={subset.title}>
                <span className="text-green-500 font-medium">
                  {subset.value}{' '}
                </span>
                <span className="text-500">{subset.title}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }
);

export const LoadableBasicCard = withLoadable(BasicCard, {
  skeleton: CardSkeleton,
});
