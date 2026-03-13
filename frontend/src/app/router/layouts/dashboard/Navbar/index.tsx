import { IconAccessible, IconChevronRight } from '@tabler/icons-react';
import { Title, Tooltip, Text, Divider, Group, UnstyledButton } from '@mantine/core';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './styles.module.css';
import { DASHBOARD_ROUTES } from '@/app/config/routes.constants';
import { NAVIGATION_MODULES } from '@/app/config/navigation.config';
import { Logo } from '@/shared/components/ui/Logo/index';
import { AccessibilityDrawer, useAccessibility } from '@/features/accessibility';

const D = DASHBOARD_ROUTES;

/**
 * Find active module based on the current URL
 * @param pathname
 * @returns
 */
function getActiveModule(pathname: string): string {
  const found = NAVIGATION_MODULES.find((module) => {
    const rootPath = D[module.key].ROOT;
    if (rootPath === D.DASHBOARD.ROOT) {
      return (
        pathname === D.DASHBOARD.ROOT ||
        pathname.startsWith(D.DASHBOARD.ACTIVITY) ||
        pathname.startsWith(D.DASHBOARD.TASKS) ||
        pathname.startsWith(D.DASHBOARD.FAVORITES)
      );
    }
    return pathname.startsWith(rootPath);
  });

  return found?.label || 'Dashboard';
}

export function DashboardNavbar() {
  const location = useLocation();
  const activeModule = getActiveModule(location.pathname);
  const { drawerOpened, openDrawer, closeDrawer } = useAccessibility();

  const mainLinks = NAVIGATION_MODULES.map((module) => {
    const rootPath = D[module.key].ROOT;
    const firstSubroute = module.subroutes[0];
    const targetPath = firstSubroute
      ? ((D[module.key][firstSubroute.key as keyof (typeof D)[typeof module.key]] as string) ?? rootPath)
      : rootPath;

    return (
      <Tooltip label={module.label} position='right' withArrow transitionProps={{ duration: 200 }} key={module.label}>
        <NavLink
          to={targetPath}
          className={styles.mainLink}
          data-active={module.label === activeModule || undefined}
          aria-label={module.label}>
          <module.icon size={20} stroke={1.5} />
        </NavLink>
      </Tooltip>
    );
  });

  const activeModuleConfig = NAVIGATION_MODULES.find((m) => m.label === activeModule);
  const subLinks = activeModuleConfig?.subroutes.map((subroute) => {
    const routePaths = D[activeModuleConfig.key];
    const path = routePaths[subroute.key as keyof typeof routePaths] as string;
    if (!path) return null;

    return (
      <NavLink to={path} className={styles.link} data-active={location.pathname === path || undefined} key={path}>
        <span>{subroute.label}</span>
        {location.pathname === path && <IconChevronRight size={14} stroke={2} />}
      </NavLink>
    );
  });

  return (
    <div className={styles.navbar}>
      <AccessibilityDrawer opened={drawerOpened} onClose={closeDrawer} />
      <div className={styles.wrapper}>
        {/* Sidebar with icons */}
        <div className={styles.aside}>
          <div className={styles.mainLinks}>{mainLinks}</div>

          {/* Accessibility settings */}
          <div className={styles.asideFooter}>
            <Tooltip label='Accesibilidad' position='right' withArrow>
              <UnstyledButton onClick={openDrawer} className={styles.mainLink} aria-label='Accesibilidad'>
                <IconAccessible size={20} stroke={1.5} />
              </UnstyledButton>
            </Tooltip>
          </div>
        </div>

        {/* Submenu panel */}
        <div className={styles.main}>
          <div className={styles.mainHeader}>
            <Title order={4} className={styles.title}>
              {activeModule}
            </Title>
            <Text size='xs' c='dimmed'>
              {activeModuleConfig?.subroutes.length} opciones
            </Text>
          </div>

          <Divider className={styles.divider} />

          <div className={styles.linksContainer}>{subLinks}</div>
        </div>
      </div>
    </div>
  );
}
