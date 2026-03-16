import { SimpleGrid, Card, Text, Group, ThemeIcon, Stack, Button, Loader, Center } from '@mantine/core';
import { IconCash, IconReceipt, IconCreditCard, IconUsers, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useStatsUsuario, useStatsAdmin } from '@/features/pagos/api/pagos.api';

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group>
        <ThemeIcon size={50} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
          <Text size="xl" fw={700}>{value}</Text>
        </div>
      </Group>
    </Card>
  );
}

function DashboardCuentahabiente() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useStatsUsuario();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mt="md">
        <StatCard
          title="Saldo total"
          value={`Q${stats?.saldoTotal?.toFixed(2) || '0.00'}`}
          icon={<IconCash size={28} />}
          color="green"
        />
        <StatCard
          title="Pagos del mes"
          value={String(stats?.pagosDelMes || 0)}
          icon={<IconReceipt size={28} />}
          color="blue"
        />
        <StatCard
          title="Total pagos"
          value={String(stats?.totalPagos || 0)}
          icon={<IconCreditCard size={28} />}
          color="violet"
        />
        <StatCard
          title="Cuentas"
          value={String(stats?.cantidadCuentas || 0)}
          icon={<IconCreditCard size={28} />}
          color="orange"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text fw={600}>Pagar un servicio</Text>
            <Text size="sm" c="dimmed">Paga tus servicios de electricidad y agua potable</Text>
            <Button rightSection={<IconArrowRight size={16} />} onClick={() => navigate('/dashboard/pagos/nuevo')}>
              Ir a pagar
            </Button>
          </Stack>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text fw={600}>Ver historial</Text>
            <Text size="sm" c="dimmed">Consulta todos tus pagos y comprobantes</Text>
            <Button variant="light" rightSection={<IconArrowRight size={16} />} onClick={() => navigate('/dashboard/pagos/historial')}>
              Ver historial
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}

function DashboardAdmin() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useStatsAdmin();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mt="md">
        <StatCard
          title="Usuarios"
          value={String(stats?.totalUsuarios || 0)}
          icon={<IconUsers size={28} />}
          color="blue"
        />
        <StatCard
          title="Total pagos"
          value={String(stats?.totalPagos || 0)}
          icon={<IconReceipt size={28} />}
          color="green"
        />
        <StatCard
          title="Pagos del mes"
          value={String(stats?.pagosDelMes || 0)}
          icon={<IconCreditCard size={28} />}
          color="violet"
        />
        <StatCard
          title="Monto del mes"
          value={`Q${stats?.montoMes?.toFixed(2) || '0.00'}`}
          icon={<IconCash size={28} />}
          color="orange"
        />
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
        <Stack>
          <Text fw={600}>Gestion de Usuarios</Text>
          <Text size="sm" c="dimmed">Administra los usuarios del sistema</Text>
          <Button variant="light" rightSection={<IconArrowRight size={16} />} onClick={() => navigate('/dashboard/admin/usuarios')}>
            Ir a usuarios
          </Button>
        </Stack>
      </Card>
    </>
  );
}

function DashboardEmpresa() {
  const navigate = useNavigate();

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
        <Stack>
          <Text fw={600}>Pagos Recibidos</Text>
          <Text size="sm" c="dimmed">Consulta los pagos realizados a tu empresa</Text>
          <Button rightSection={<IconArrowRight size={16} />} onClick={() => navigate('/dashboard/empresa/pagos')}>
            Ver pagos
          </Button>
        </Stack>
      </Card>
    </>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const getSubtitle = () => {
    switch (user?.role) {
      case 'administrador': return 'Panel de administracion del sistema';
      case 'cuentahabiente': return 'Resumen de tus cuentas y pagos';
      case 'empresa_servicio': return 'Panel de empresa de servicios';
      default: return 'Bienvenido al sistema';
    }
  };

  return (
    <>
      <PageHeader title={`Bienvenido, ${user?.fullName || 'Usuario'}`} subtitle={getSubtitle()} />

      {user?.role === 'cuentahabiente' && <DashboardCuentahabiente />}
      {user?.role === 'administrador' && <DashboardAdmin />}
      {user?.role === 'empresa_servicio' && <DashboardEmpresa />}
    </>
  );
}
