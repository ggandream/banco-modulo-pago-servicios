import { createTheme, alpha, MantineTheme, ButtonProps } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'Inter, system-ui, sans-serif',
  components: {
    Button: {
      vars: (theme: MantineTheme, props: ButtonProps) => {
        if (props.variant === 'cta') {
          const primaryColor = theme.colors[theme.primaryColor];
          return {
            root: {
              '--button-bg': primaryColor[6],
              '--button-hover': primaryColor[7],
              '--button-color': 'white',
            },
          };
        }
        return { root: {} };
      },
      styles: (theme: MantineTheme, props: ButtonProps) => {
        if (props.variant === 'cta') {
          const primaryColor = theme.colors[theme.primaryColor][6];
          return {
            root: {
              boxShadow: `0 4px 12px ${alpha(primaryColor, 0.35)}`,
            },
          };
        }
        return {};
      },
    },
  },
});
