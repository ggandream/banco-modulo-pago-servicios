import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/login.page';
import { AppLayout } from './layouts/app.layout';
import { DASHBOARD_ROUTES, ROUTES } from '../config/routes.constants';
import { lazy, Suspense } from 'react';
import { LoadingOverlay } from '@mantine/core';

const D = DASHBOARD_ROUTES;

const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard.page'));
const NuevoPagoPage = lazy(() => import('@/features/pagos/pages/nuevo-pago.page'));
const HistorialPage = lazy(() => import('@/features/pagos/pages/historial.page'));
const ComprobantePage = lazy(() => import('@/features/pagos/pages/comprobante.page'));
const UsuariosPage = lazy(() => import('@/features/admin/pages/usuarios.page'));
const PagosEmpresaPage = lazy(() => import('@/features/empresa/pages/pagos-empresa.page'));
const PerfilPage = lazy(() => import('@/features/perfil/pages/perfil.page'));

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
      // Dashboard
      { path: D.DASHBOARD.ROOT, element: p(DashboardPage) },

      // Pagos
      { path: D.PAGOS.NUEVO, element: p(NuevoPagoPage) },
      { path: D.PAGOS.HISTORIAL, element: p(HistorialPage) },
      { path: '/dashboard/pagos/comprobante/:pagoId', element: p(ComprobantePage) },

      // Admin
      { path: D.ADMIN.USUARIOS, element: p(UsuariosPage) },

      // Empresa
      { path: D.EMPRESA.PAGOS, element: p(PagosEmpresaPage) },

      // Perfil
      { path: D.PERFIL.ROOT, element: p(PerfilPage) },
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
