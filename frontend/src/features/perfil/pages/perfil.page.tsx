import { Card, Text, Group, Badge, SimpleGrid, Stack, Loader, Center, ThemeIcon } from '@mantine/core';
import { IconUser, IconCreditCard } from '@tabler/icons-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useCuentas } from '@/features/pagos/api/pagos.api';

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user);
  const { data: cuentas, isLoading } = useCuentas();

  const rolLabel = {
    administrador: 'Administrador',
    cuentahabiente: 'Cuentahabiente',
    empresa_servicio: 'Empresa de Servicios',
  }[user?.role || ''] || user?.role;

  return (
    <>
      <PageHeader title="Mi Perfil" subtitle="Informacion personal y cuentas bancarias" />

      <Card shadow="sm" padding="lg" radius="md" withBorder mt="md" maw={500}>
        <Group mb="md">
          <ThemeIcon size={50} radius="xl" variant="light">
            <IconUser size={28} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="lg">{user?.fullName}</Text>
            <Text size="sm" c="dimmed">@{user?.username}</Text>
          </div>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text c="dimmed">Correo:</Text>
            <Text>{user?.email}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed">Rol:</Text>
            <Badge variant="light">{rolLabel}</Badge>
          </Group>
        </Stack>
      </Card>

      {user?.role === 'cuentahabiente' && (
        <>
          <Text fw={600} size="lg" mt="xl" mb="md">Mis Cuentas Bancarias</Text>
          {isLoading ? (
            <Center><Loader /></Center>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {cuentas?.map((cuenta) => (
                <Card key={cuenta.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group mb="xs">
                    <ThemeIcon variant="light" color="blue">
                      <IconCreditCard size={20} />
                    </ThemeIcon>
                    <Text fw={600}>{cuenta.tipoCuenta}</Text>
                  </Group>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Numero:</Text>
                      <Text size="sm" ff="monospace">{cuenta.numeroCuenta}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Saldo:</Text>
                      <Text size="lg" fw={700} c="green">Q{Number(cuenta.saldo).toFixed(2)}</Text>
                    </Group>
                    <Badge color={cuenta.estado ? 'green' : 'gray'} variant="dot" size="sm">
                      {cuenta.estado ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </>
  );
}
