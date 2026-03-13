import '@mantine/core';

declare module '@mantine/core' {
  export interface ButtonProps {
    variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'transparent' | 'white' | 'default' | 'gradient' | 'cta';
  }
}
