import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { getMenuItemKey, MenuItem } from '../app-sub-menu';
import TopbarSubmenu from '../top-bar-submenu';

interface AppTopBarProps {
  onToggleMenuClick: (event: React.MouseEvent) => void;
  onMobileTopbarMenuClick: (event: React.MouseEvent) => void;
  onMobileSubTopbarMenuClick: (event: React.MouseEvent) => void;
  mobileTopbarMenuActive: boolean;
  layoutColorMode: 'light' | 'dark';
  endItems: MenuItem[];
}

export const AppTopBar: React.FC<AppTopBarProps> = (props) => {
  return (
    <div className="layout-topbar">
      <Link to="/" className="layout-topbar-logo">
        <span>DELS</span>
      </Link>

      <button
        type="button"
        className="p-link  layout-menu-button layout-topbar-button"
        onClick={props.onToggleMenuClick}
      >
        <i className="pi pi-bars" />
      </button>
      <button
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={props.onMobileTopbarMenuClick}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <ul
        className={cx('layout-topbar-menu lg:flex origin-top', {
          'layout-topbar-menu-mobile-active': props.mobileTopbarMenuActive,
        })}
      >
        {props.endItems.map((item) => (
          <li key={getMenuItemKey(item)}>
            <TopbarSubmenu items={item.items ?? []} />
          </li>
        ))}
      </ul>
    </div>
  );
};
