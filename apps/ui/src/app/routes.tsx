import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import React from 'react';
import { LoginPage } from './pages/login';
import { EmptyLayout } from './layout/empty';
import { BaseLayout } from './layout/base';
import { LogsPage } from './pages/logs';
import NotFoundPage from './pages/not-found';
import { useLocation } from './hooks/use-location';
import SettingsPage from './pages/settings';
import DashboardPage from './pages/dashboard';

export interface AppRoutesProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
}

const AuthenticatedRoutes: React.FunctionComponent<{
  isAuthenticated: boolean;
}> = ({ isAuthenticated }) => {
  let location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  return <Outlet />;
};

export const AppRoutes: React.FC<AppRoutesProps> = ({
  isAuthenticated,
  onSignOut,
}) => {
  return (
    <Routes>
      <Route element={<EmptyLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        element={<AuthenticatedRoutes isAuthenticated={isAuthenticated} />}
      >
        <Route element={<BaseLayout onSignOut={onSignOut} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
