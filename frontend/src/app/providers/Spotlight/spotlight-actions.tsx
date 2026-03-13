import type { SpotlightActionData } from '@mantine/spotlight';
import { DASHBOARD_ROUTES } from '@/app/config/routes.constants';
import { NAVIGATION_MODULES } from '@/app/config/navigation.config';

export function createSpotlightActions(navigate: (path: string) => void): SpotlightActionData[] {
  const actions: SpotlightActionData[] = [];

  for (const module of NAVIGATION_MODULES) {
    const Icon = module.icon;
    const routePaths = DASHBOARD_ROUTES[module.key];

    // ROOT action of the module (always present in spotlight)
    actions.push({
      id: routePaths.ROOT,
      label: module.label,
      description: module.rootDescription,
      leftSection: <Icon size={20} stroke={1.5} />,
      onClick: () => navigate(routePaths.ROOT),
      keywords: [module.label, module.rootDescription].join(' ').toLowerCase(),
    });

    // Sub-route actions
    for (const subroute of module.subroutes) {
      if (subroute.key === 'ROOT') continue;

      const path = routePaths[subroute.key as keyof typeof routePaths];
      if (!path) continue;

      const description = subroute.description || subroute.label;

      actions.push({
        id: path,
        label: `${module.label} → ${subroute.label}`,
        description,
        leftSection: <Icon size={20} stroke={1.5} />,
        onClick: () => navigate(path),
        keywords: [module.label, subroute.label, description].join(' ').toLowerCase(),
      });
    }
  }

  return actions;
}
