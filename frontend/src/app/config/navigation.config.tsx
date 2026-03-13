/**
 * Centralized navigation configuration
 * This is the true source for labels, icons, and module descriptions.
 * Paths come from routes.constants.ts
 */
import { IconLayoutDashboard } from '@tabler/icons-react';
import type { DashboardRoutesKey } from './routes.constants';

// ============================================================================
// TYPES
// ============================================================================
export type NavSubroute = {
  key: string;
  label: string;
  description?: string;
};

export type NavModule = {
  key: DashboardRoutesKey;
  label: string;
  icon: React.FC<{ size?: number | string; stroke?: number }>;
  rootDescription: string;
  subroutes: NavSubroute[];
};

// ============================================================================
// MODULE CONFIGURATION
// ============================================================================
export const NAVIGATION_MODULES: NavModule[] = [
  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  {
    key: 'DASHBOARD',
    label: 'Dashboard',
    icon: IconLayoutDashboard,
    rootDescription: 'Panel principal',
    subroutes: [{ key: 'ROOT', label: 'Resumen', description: 'Panel principal' }],
  },
];
