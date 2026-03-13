import type { MantineColorScheme } from '@mantine/core';

export type ColorScheme = Exclude<MantineColorScheme, 'auto'>;

export interface AccessibilityOptions {
  colorScheme: ColorScheme;
}
