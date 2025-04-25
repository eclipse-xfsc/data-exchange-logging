import React from 'react';
import { CSSTransition } from 'react-transition-group';
import cx from 'classnames';
import { Ripple } from 'primereact/ripple';
import { Badge } from 'primereact/badge';
import { NavLink } from 'react-router-dom';
import { MenuItem as PrimeMenuItem } from 'primereact/menuitem';

export type MenuItem = PrimeMenuItem & {
  badge?: string;
  badgeStyleClass?: string;
  items?: MenuItem[];
  to?: string;
  key?: string;
} & ({ to: string } | { label: string } | { key: string });

export type MenuItemClickHandler = (event: {
  originalEvent: React.MouseEvent;
  item: any;
}) => void;

export const getMenuItemKey = (item: MenuItem) =>
  item.key ?? item.label ?? item.to;

interface AppSubmenuProps {
  items?: MenuItem[];
  className?: string;
  root?: boolean;
  role?: string;
  onMenuItemClick: MenuItemClickHandler;
}

const AppSubmenu: React.FC<AppSubmenuProps> = (props) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const onMenuItemClick = (
    event: React.MouseEvent,
    item: MenuItem,
    index: number
  ) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }

    setActiveIndex(index);

    if (props.onMenuItemClick) {
      props.onMenuItemClick({
        originalEvent: event,
        item: item,
      });
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLAnchorElement> = (event) => {
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      (event.target as HTMLAnchorElement).click();
    }
  };

  const renderLinkContent = (item: MenuItem) => {
    let submenuIcon = item.items && (
      <i className="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>
    );
    let badge = item.badge && <Badge value={item.badge} />;

    return (
      <React.Fragment>
        <i className={item.icon}></i>
        <span>{item.label}</span>
        {submenuIcon}
        {badge}
        <Ripple />
      </React.Fragment>
    );
  };

  const renderLink = (item: MenuItem, i: number) => {
    let content = renderLinkContent(item);

    if (item.to) {
      return (
        <NavLink
          aria-label={item.label}
          onKeyDown={onKeyDown}
          role="menuitem"
          className={({ isActive }) =>
            cx('p-ripple', {
              'router-link-active router-link-exact-active': isActive,
            })
          }
          to={item.to}
          onClick={(e) => onMenuItemClick(e, item, i)}
          target={item.target}
        >
          {content}
        </NavLink>
      );
    } else {
      return (
        <a
          tabIndex={0}
          aria-label={item.label}
          onKeyDown={onKeyDown}
          role="menuitem"
          href={item.url}
          className="p-ripple"
          onClick={(e) => onMenuItemClick(e, item, i)}
          target={item.target}
        >
          {content}
        </a>
      );
    }
  };

  let items =
    props.items &&
    props.items.map((item, i) => {
      let active = activeIndex === i;
      let key = getMenuItemKey(item);
      let styleClass = cx(item.badgeStyleClass, {
        'layout-menuitem-category': props.root,
        'active-menuitem': active && !item.to,
      });

      if (props.root) {
        return (
          <li className={styleClass} key={key} role="none">
            {props.root === true && (
              <React.Fragment>
                <div
                  className="layout-menuitem-root-text"
                  aria-label={item.label}
                >
                  {item.label}
                </div>
                <AppSubmenu
                  items={item.items}
                  onMenuItemClick={props.onMenuItemClick}
                />
              </React.Fragment>
            )}
          </li>
        );
      } else {
        return (
          <li className={styleClass} key={key} role="none">
            {renderLink(item, i)}
            <CSSTransition
              classNames="layout-submenu-wrapper"
              timeout={{ enter: 1000, exit: 450 }}
              in={active}
              unmountOnExit
            >
              <AppSubmenu
                items={item.items}
                onMenuItemClick={props.onMenuItemClick}
              />
            </CSSTransition>
          </li>
        );
      }
    });

  return items ? (
    <ul className={props.className} role="menu">
      {items}
    </ul>
  ) : null;
};

export default AppSubmenu;
