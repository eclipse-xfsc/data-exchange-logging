import React from 'react';
import classNames from 'classnames';
import { Outlet } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import PrimeReact from 'primereact/api';
import { AppMenu } from '../../components/app-menu';
import { AppTopBar } from '../../components/topbar';
import { MenuItem, MenuItemClickHandler } from '../../components/app-sub-menu';
import { AppFooter } from '../../components/app-footer/intex';
import { Toast } from 'primereact/toast';
import { ToastContext } from '../../hooks/use-toast';

interface BaseLayoutProps {
  onSignOut: () => void;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ onSignOut }) => {
  const [layoutMode, setLayoutMode] = React.useState<'static' | 'overlay'>(
    'static'
  );
  const [layoutColorMode, setLayoutColorMode] = React.useState<
    'light' | 'dark'
  >('light');
  const [inputStyle, setInputStyle] = React.useState<'outlined' | 'filled'>(
    'outlined'
  );
  const [ripple, setRipple] = React.useState(true);
  const [staticMenuInactive, setStaticMenuInactive] = React.useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = React.useState(false);
  const [mobileMenuActive, setMobileMenuActive] = React.useState(false);
  const [mobileTopbarMenuActive, setMobileTopbarMenuActive] =
    React.useState(false);
  PrimeReact.ripple = true;
  let menuClick = false;
  let mobileTopbarMenuClick = false;
  const toast = React.useRef<Toast>(null);

  React.useEffect(() => {
    if (mobileMenuActive) {
      addClass(document.body, 'body-overflow-hidden');
    } else {
      removeClass(document.body, 'body-overflow-hidden');
    }
  }, [mobileMenuActive]);

  const onWrapperClick = (event: React.MouseEvent) => {
    if (!menuClick) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }

    if (!mobileTopbarMenuClick) {
      setMobileTopbarMenuActive(false);
    }

    mobileTopbarMenuClick = false;
    menuClick = false;
  };

  const onToggleMenuClick = (event: React.MouseEvent) => {
    menuClick = true;
    if (isDesktop()) {
      if (layoutMode === 'overlay') {
        if (mobileMenuActive === true) {
          setOverlayMenuActive(true);
        }
        setOverlayMenuActive((prevState) => !prevState);
        setMobileMenuActive(false);
      } else if (layoutMode === 'static') {
        setStaticMenuInactive((prevState) => !prevState);
      }
    } else {
      setMobileMenuActive((prevState) => !prevState);
    }
    event.preventDefault();
  };

  const onSidebarClick = () => {
    menuClick = true;
  };

  const onMobileTopbarMenuClick = (event: React.MouseEvent) => {
    mobileTopbarMenuClick = true;

    setMobileTopbarMenuActive((prevState) => !prevState);
    event.preventDefault();
  };

  const onMobileSubTopbarMenuClick = (event: React.MouseEvent) => {
    mobileTopbarMenuClick = true;

    event.preventDefault();
  };

  const onMenuItemClick: MenuItemClickHandler = (event) => {
    if (!event.item.items) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }
  };
  const isDesktop = () => {
    return window.innerWidth >= 992;
  };

  const menu: MenuItem[] = [
    {
      items: [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
        {
          label: 'Transaction Logs',
          icon: 'pi pi-fw pi-sort-alt',
          to: '/logs',
        },
        { label: 'Settings', icon: 'pi pi-fw pi-cog', to: '/settings' },
      ] as MenuItem[],
      key: 'main',
    },
  ];

  const topbarMenu: MenuItem[] = [
    {
      icon: 'pi pi-user',
      items: [
        {
          label: 'Quit',
          icon: 'pi pi-fw pi-sign-out',
          command: onSignOut,
        },
      ],
      key: 'topbar',
    },
  ];

  const addClass = (element: HTMLElement, className: string) => {
    if (element.classList) element.classList.add(className);
    else element.className += ' ' + className;
  };

  const removeClass = (element: HTMLElement, className: string) => {
    if (element.classList) element.classList.remove(className);
    else
      element.className = element.className.replace(
        new RegExp(
          '(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
  };

  const wrapperClass = classNames('layout-wrapper', {
    'layout-overlay': layoutMode === 'overlay',
    'layout-static': layoutMode === 'static',
    'layout-static-sidebar-inactive':
      staticMenuInactive && layoutMode === 'static',
    'layout-overlay-sidebar-active':
      overlayMenuActive && layoutMode === 'overlay',
    'layout-mobile-sidebar-active': mobileMenuActive,
    'p-input-filled': inputStyle === 'filled',
    'p-ripple-disabled': ripple === false,
    'layout-theme-light': layoutColorMode === 'light',
  });

  return (
    <div className={wrapperClass} onClick={onWrapperClick}>
      <Toast ref={toast} />
      <ToastContext.Provider value={toast}>
        <AppTopBar
          endItems={topbarMenu}
          onToggleMenuClick={onToggleMenuClick}
          layoutColorMode={layoutColorMode}
          mobileTopbarMenuActive={mobileTopbarMenuActive}
          onMobileTopbarMenuClick={onMobileTopbarMenuClick}
          onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick}
        />

        <div className="layout-sidebar" onClick={onSidebarClick}>
          <AppMenu
            model={menu}
            onMenuItemClick={onMenuItemClick}
            layoutColorMode={layoutColorMode}
          />
        </div>

        <div className="layout-main-container">
          <div className="layout-main">
            <Outlet />
          </div>

          <AppFooter layoutColorMode={layoutColorMode} />
        </div>

        <CSSTransition
          classNames="layout-mask"
          timeout={{ enter: 200, exit: 200 }}
          in={mobileMenuActive}
          unmountOnExit
        >
          <div className="layout-mask p-component-overlay"></div>
        </CSSTransition>
      </ToastContext.Provider>
    </div>
  );
};
