import { CSSVariablesResolver, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { theme } from './theme';

const resolver: CSSVariablesResolver = () => ({
  variables: {
    '--appshell-bg': '#f1f5f9',
    '--second-navbar-bg': '#f8fafc',
  },
  light: {
    '--appshell-bg': '#f1f5f9',
    '--second-navbar-bg': '#f8fafc',
  },
  dark: {
    '--appshell-bg': '--mantine-color-gray-1',
    '--second-navbar-bg': '--mantine-color-gray-8',
  },
});

export function MantineAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme='light' cssVariablesResolver={resolver}>
      {children}
    </MantineProvider>
  );
}
