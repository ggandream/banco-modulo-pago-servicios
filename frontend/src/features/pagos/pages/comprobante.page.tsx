import { Paper, Title, Text, Group, Stack, Divider, Badge, Button, Loader, Center } from '@mantine/core';
import { IconPrinter, IconArrowLeft } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { useComprobante } from '../api/pagos.api';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function ComprobantePage() {
  const { pagoId } = useParams();
  const navigate = useNavigate();
  const { data: pago, isLoading } = useComprobante(Number(pagoId));

  if (isLoading) {
    return <Center mt="xl"><Loader /></Center>;
  }

  if (!pago) {
    return <Text ta="center" mt="xl" c="dimmed">Comprobante no encontrado</Text>;
  }

  return (
    <>
      <PageHeader title="Comprobante de Pago" subtitle={`Comprobante #${pago.comprobante?.numeroComprobante}`} />

      <Group mt="md" mb="md">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button variant="light" leftSection={<IconPrinter size={16} />} onClick={() => window.print()}>
          Imprimir
        </Button>
      </Group>

      <Paper p="xl" withBorder radius="md" maw={600} mx="auto">
        <Stack align="center" mb="md">
          <Title order={3}>Comprobante de Pago</Title>
          <Badge size="lg" color="green" variant="light">
            {pago.estado.toUpperCase()}
          </Badge>
        </Stack>

        <Divider mb="md" />

        <Stack gap="sm">
          <Group justify="space-between">
            <Text c="dimmed">No. Comprobante:</Text>
            <Text fw={600} ff="monospace">{pago.comprobante?.numeroComprobante}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed">Fecha de emision:</Text>
            <Text>{new Date(pago.comprobante?.fechaEmision || pago.fechaPago).toLocaleString('es-GT')}</Text>
          </Group>

          <Divider my="xs" />

          <Group justify="space-between">
            <Text c="dimmed">Empresa:</Text>
            <Text fw={500}>{pago.empresa.nombre}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed">Tipo de servicio:</Text>
            <Text>{pago.empresa.tipoServicio?.nombre}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed">Numero de contador:</Text>
            <Text ff="monospace">{pago.numeroContador}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed">Periodo:</Text>
            <Text>{MESES[pago.mesCorrespondiente - 1]} {pago.anioCorrespondiente}</Text>
          </Group>

          <Divider my="xs" />

          <Group justify="space-between">
            <Text c="dimmed">Cuenta debitada:</Text>
            <Text ff="monospace">{pago.cuentaBancaria?.numeroCuenta}</Text>
          </Group>
          <Group justify="space-between">
            <Text c="dimmed">Cliente:</Text>
            <Text>{pago.usuario?.nombreCompleto}</Text>
          </Group>

          <Divider my="xs" />

          <Group justify="space-between">
            <Text fw={600} size="lg">Monto pagado:</Text>
            <Text fw={700} size="lg" c="green">Q{Number(pago.montoPagado).toFixed(2)}</Text>
          </Group>
        </Stack>
      </Paper>
    </>
  );
}
