interface AppFooterProps {
  layoutColorMode: 'light' | 'dark';
}

export const AppFooter: React.FC<AppFooterProps> = (props) => {
  return (
    <div className="layout-footer">
      <span className="font-medium ml-2">DELS</span>
    </div>
  );
};
