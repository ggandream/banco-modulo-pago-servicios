/**
 * Centralized navigation configuration
 * This is the true source for labels, icons, and module descriptions.
 * Paths come from routes.constants.ts
 */
import {
  IconLayoutDashboard,
  IconCreditCard,
  IconUserCog,
  IconBuilding,
  IconUser,
} from '@tabler/icons-react';
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
  roles?: string[]; // Si no se define, visible para todos
};

// ============================================================================
// MODULE CONFIGURATION
// ============================================================================
export const NAVIGATION_MODULES: NavModule[] = [
  {
    key: 'DASHBOARD',
    label: 'Dashboard',
    icon: IconLayoutDashboard,
    rootDescription: 'Panel principal',
    subroutes: [{ key: 'ROOT', label: 'Resumen', description: 'Panel principal' }],
  },
  {
    key: 'PAGOS',
    label: 'Pagos',
    icon: IconCreditCard,
    rootDescription: 'Pago de servicios',
    subroutes: [
      { key: 'NUEVO', label: 'Pagar servicio', description: 'Realizar un nuevo pago' },
      { key: 'HISTORIAL', label: 'Historial', description: 'Historial de pagos' },
    ],
    roles: ['cuentahabiente'],
  },
  {
    key: 'ADMIN',
    label: 'Administracion',
    icon: IconUserCog,
    rootDescription: 'Panel de administracion',
    subroutes: [
      { key: 'USUARIOS', label: 'Usuarios', description: 'Gestion de usuarios' },
    ],
    roles: ['administrador'],
  },
  {
    key: 'EMPRESA',
    label: 'Empresa',
    icon: IconBuilding,
    rootDescription: 'Panel de empresa',
    subroutes: [
      { key: 'PAGOS', label: 'Pagos recibidos', description: 'Consulta de pagos' },
    ],
    roles: ['empresa_servicio'],
  },
  {
    key: 'PERFIL',
    label: 'Perfil',
    icon: IconUser,
    rootDescription: 'Mi perfil',
    subroutes: [{ key: 'ROOT', label: 'Mi perfil', description: 'Informacion personal' }],
  },
];
