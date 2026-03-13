import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/login.page';
import { AppLayout } from './layouts/app.layout';
import { DASHBOARD_ROUTES, ROUTES } from '../config/routes.constants';
import { lazy, Suspense } from 'react';
import { LoadingOverlay } from '@mantine/core';

const D = DASHBOARD_ROUTES;
const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard.page'));

// ---------------------------------------------------------------------------
// Suspense wrapper
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense fallback={<LoadingOverlay visible loaderProps={{ type: 'dots' }} />}>
      <Component />
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  // ===========================================================================
  // AUTH
  // ===========================================================================
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },

  // ===========================================================================
  // DASHBOARD (Rutas protegidas)
  // ===========================================================================
  {
    element: <AppLayout />,
    children: [
      // -----------------------------------------------------------------------
      // Dashboard (Role-based routing)
      // -----------------------------------------------------------------------
      { path: D.DASHBOARD.ROOT, element: p(DashboardPage) },

      // -----------------------------------------------------------------------
      // Dashboard - Servicios
      // -----------------------------------------------------------------------
      // { path: D.SALES.ROOT, element: p(ServicesListPage) },
      // { path: D.SALES.PAY, element: p(PayServicePage) },
    ],
  },

  // ===========================================================================
  // FALLBACK
  // ===========================================================================
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
];
