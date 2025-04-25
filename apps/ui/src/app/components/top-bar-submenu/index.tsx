import { Menu } from 'primereact/menu';
import React from 'react';
import { MenuItem } from '../app-sub-menu';

interface TopbarSubmenuProps {
  items: MenuItem[];
}

const TopbarSubmenu: React.FC<TopbarSubmenuProps> = (props) => {
  const menu = React.useRef<Menu>(null);
  const toggleMenu = (event: React.MouseEvent) => {
    menu.current && menu.current.toggle(event);
  };
  return (
    <>
      <button className="p-link layout-topbar-button" onClick={toggleMenu}>
        <i className="pi pi-user" />
        <span>Profile</span>
      </button>
      <Menu ref={menu} model={props.items} popup />
    </>
  );
};

export default TopbarSubmenu;
