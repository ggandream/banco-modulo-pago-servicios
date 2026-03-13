/**
 * Constantes de rutas de navegación del frontend
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
// RUTAS DE NAVEGACIÓN POR MÓDULO
// ============================================================================
export const DASHBOARD_ROUTES = {
  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  DASHBOARD: {
    ROOT: '/dashboard',
  },
} as const;

// ============================================================================
// TIPOS
// ============================================================================
export type DashboardRoutesKey = keyof typeof DASHBOARD_ROUTES;
