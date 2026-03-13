import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './dashboard/Header';
import styles from './styles.module.css';
import { DashboardNavbar } from './dashboard/Navbar';
import { SpotlightProvider } from '@/app/providers/Spotlight/spotlight.provider';

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <>
      <SpotlightProvider />
      <AppShell
        padding='md'
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}>
        <AppShell.Header className={styles.appShellHeader}>
          <Group h='100%' px='md' hiddenFrom='sm' bg={'var(--appshell-bg)'}>
            <Burger opened={opened} onClick={toggle} size='sm' />
          </Group>
          <DashboardHeader />
        </AppShell.Header>

        <AppShell.Navbar>
          <DashboardNavbar />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </>
  );
}
