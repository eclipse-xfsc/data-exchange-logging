import React from 'react';
import AppSubmenu, { MenuItem, MenuItemClickHandler } from '../app-sub-menu';

interface AppMenuProps {
  model: MenuItem[];
  onMenuItemClick: MenuItemClickHandler;
  layoutColorMode?: 'dark' | 'light';
}

export const AppMenu: React.FC<AppMenuProps> = (props) => {
  return (
    <div className="layout-menu-container">
      <AppSubmenu
        items={props.model}
        className="layout-menu"
        onMenuItemClick={props.onMenuItemClick}
        root={true}
        role="menu"
      />
    </div>
  );
};
