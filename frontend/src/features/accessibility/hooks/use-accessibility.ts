import { useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ColorScheme } from '../types/accessibility.types';

export function useAccessibility() {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const changeColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  return {
    drawerOpened,
    openDrawer,
    closeDrawer,
    colorScheme: colorScheme as ColorScheme,
    toggleColorScheme,
    changeColorScheme,
  };
}
