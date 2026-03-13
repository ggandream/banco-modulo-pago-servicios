import { Stack, Title, Text, ThemeIcon } from '@mantine/core';
import { IconHammer } from '@tabler/icons-react';

type Props = {
  moduleName?: string;
};

export default function UnderConstruction({ moduleName }: Props) {
  return (
    <Stack align='center' justify='center' h='60vh' gap='md'>
      <ThemeIcon size={64} radius='xl' variant='light' color='yellow'>
        <IconHammer size={32} />
      </ThemeIcon>
      <Title order={2}>En desarrollo</Title>
      <Text c='dimmed' ta='center' maw={400}>
        {moduleName
          ? `El módulo de ${moduleName} estará disponible próximamente.`
          : 'Esta sección estará disponible próximamente.'}
      </Text>
    </Stack>
  );
}
