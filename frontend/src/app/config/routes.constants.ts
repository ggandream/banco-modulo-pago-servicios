/**
 * Constantes de rutas de navegacion del frontend
 * Esta es la fuente de verdad para todas las rutas del SPA
 */

// ============================================================================
// RUTAS BASE
// ============================================================================
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

// ============================================================================
// RUTAS DE NAVEGACION POR MODULO
// ============================================================================
export const DASHBOARD_ROUTES = {
  DASHBOARD: {
    ROOT: '/dashboard',
  },
  PAGOS: {
    ROOT: '/dashboard/pagos',
    NUEVO: '/dashboard/pagos/nuevo',
    HISTORIAL: '/dashboard/pagos/historial',
  },
  ADMIN: {
    ROOT: '/dashboard/admin',
    USUARIOS: '/dashboard/admin/usuarios',
  },
  EMPRESA: {
    ROOT: '/dashboard/empresa',
    PAGOS: '/dashboard/empresa/pagos',
  },
  PERFIL: {
    ROOT: '/dashboard/perfil',
  },
} as const;

// ============================================================================
// TIPOS
// ============================================================================
export type DashboardRoutesKey = keyof typeof DASHBOARD_ROUTES;
