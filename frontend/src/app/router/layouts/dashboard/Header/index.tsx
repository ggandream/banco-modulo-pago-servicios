import {
  Group,
  ActionIcon,
  Indicator,
  Menu,
  Avatar,
  Text,
  UnstyledButton,
  Divider,
  Badge,
  Tooltip,
} from '@mantine/core';
import { IconBell, IconSettings, IconUser, IconLogout, IconChevronDown } from '@tabler/icons-react';
import styles from './styles.module.css';
import { SearchControl } from '@/shared/components/ui/SearchControl';
import { Logo } from '@/shared/components/ui/Logo';

export default function DashboardHeader() {
  return (
    <Group h='100%' px='md' className={styles.header}>
      <Group justify='center' pb={'md'} pt={'xs'} visibleFrom='sm'>
        <Logo size={96} />
      </Group>
      <Group gap={'xs'}>
        <SearchControl breakpoint='md' />
      </Group>
      <Group gap='xs'>
        <Menu width={320} position='bottom-end' shadow='md' radius='md'>
          <Menu.Target>
            <Tooltip label='Notificaciones' withArrow>
              <Indicator color='red' size={8} offset={4}>
                <ActionIcon variant='subtle' color='gray' size='lg' radius='md'>
                  <IconBell size={20} stroke={1.5} />
                </ActionIcon>
              </Indicator>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <Group justify='space-between'>
                <Text size='sm' fw={600}>
                  Notificaciones
                </Text>
                <Badge size='sm' variant='light'>
                  3 nuevas
                </Badge>
              </Group>
            </Menu.Label>

            <NotificationItem title='Recordatorio' description='Pagar servicio de luz' time='Hace 5 min' unread />
            <NotificationItem title='Recordatorio' description='Pagar servicio de agua' time='Hace 1 hora' unread />

            <Divider my={8} />
            <Menu.Item ta='center' c='violet.6' fw={500}>
              Ver todas las notificaciones
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Divider orientation='vertical' mx={8} />

        <Menu width={200} position='bottom-end' shadow='md' radius='md'>
          <Menu.Target>
            <UnstyledButton className={styles.userButton}>
              <Group gap={8}>
                <Avatar src={null} alt='Usuario' radius='md' size={34} color='violet'>
                  JD
                </Avatar>
                <div className={styles.userInfo}>
                  <Text size='sm' fw={500} lh={1.2}>
                    Jhon Doe
                  </Text>
                  <Text size='xs' c='dimmed' lh={1.2}>
                    Cliente
                  </Text>
                </div>
                <IconChevronDown size={14} stroke={1.5} className={styles.chevron} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Cuenta</Menu.Label>
            <Menu.Item leftSection={<IconUser size={16} stroke={1.5} />}>Mi perfil</Menu.Item>
            <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>Configuración</Menu.Item>

            <Divider my={8} />

            <Menu.Item color='red' leftSection={<IconLogout size={16} stroke={1.5} />}>
              Cerrar sesión
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}

/**
 * Componente auxiliar para notificaciones
 */
interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}

function NotificationItem({ title, description, time, unread }: NotificationItemProps) {
  return (
    <Menu.Item className={styles.notificationItem} data-unread={unread || undefined}>
      <Group gap='xs' wrap='nowrap' align='flex-start'>
        {unread && <div className={styles.unreadDot} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size='sm' fw={unread ? 600 : 500} truncate>
            {title}
          </Text>
          <Text size='xs' c='dimmed' lineClamp={1}>
            {description}
          </Text>
          <Text size='xs' c='dimmed' mt={4}>
            {time}
          </Text>
        </div>
      </Group>
    </Menu.Item>
  );
}
