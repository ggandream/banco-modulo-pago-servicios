import { IconSun, IconMoon } from '@tabler/icons-react';
import { Drawer, Stack, Text, Switch, Group, useMantineColorScheme } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';

interface AccessibilityDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function AccessibilityDrawer({ opened, onClose }: AccessibilityDrawerProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const handleToggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  useHotkeys([['mod + J', () => handleToggleTheme()]]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Accesibilidad'
      position='left'
      size='xs'
      overlayProps={{ backgroundOpacity: 0.5, blur: 2 }}>
      <Stack gap='lg'>
        <div>
          <Text size='sm' fw={500} mb='xs'>
            Apariencia
          </Text>
          <Group justify='space-between'>
            <Group gap='xs'>
              {isDark ? <IconMoon size={18} stroke={1.5} /> : <IconSun size={18} stroke={1.5} />}
              <Text size='sm'>{isDark ? 'Modo oscuro' : 'Modo claro'}</Text>
            </Group>
            <Switch checked={isDark} onChange={handleToggleTheme} size='md' aria-label='Cambiar tema' />
          </Group>
        </div>
      </Stack>
    </Drawer>
  );
}
