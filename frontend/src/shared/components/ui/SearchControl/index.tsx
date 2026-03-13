import { UnstyledButton, Text, Kbd, Group, Box, rem } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { spotlight } from '@mantine/spotlight';
import styles from './styles.module.css';

type SearchControlProps = {
  width?: number | string;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export function SearchControl({ width = 240, breakpoint = 'sm' }: SearchControlProps) {
  return (
    <>
      {/* Mobile: Only icon */}
      <Box hiddenFrom={breakpoint}>
        <UnstyledButton onClick={spotlight.open} className={styles.compactControl} aria-label='Buscar (Ctrl+K)'>
          <IconSearch size={20} stroke={1.5} />
        </UnstyledButton>
      </Box>

      {/* Desktop: input complete */}
      <Box visibleFrom={breakpoint}>
        <UnstyledButton onClick={spotlight.open} className={styles.control} style={{ width: rem(width) }}>
          <Group justify='space-between' wrap='nowrap'>
            <Group gap='xs' wrap='nowrap'>
              <IconSearch size={16} stroke={1.5} className={styles.icon} />
              <Text size='sm' c='dimmed'>
                Buscar...
              </Text>
            </Group>
            <Kbd size='xs' className={styles.kbd}>
              Ctrl + K
            </Kbd>
          </Group>
        </UnstyledButton>
      </Box>
    </>
  );
}
