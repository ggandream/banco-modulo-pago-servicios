import { Badge, Table, Text, ActionIcon, Tooltip, Loader, Center } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { useHistorial } from '../api/pagos.api';

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export default function HistorialPage() {
  const navigate = useNavigate();
  const { data: pagos, isLoading } = useHistorial();

  const statusColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'green';
      case 'pendiente': return 'yellow';
      case 'rechazado': return 'red';
      default: return 'gray';
    }
  };

  return (
    <>
      <PageHeader title="Historial de Pagos" subtitle="Consulta todos tus pagos realizados" />

      {isLoading ? (
        <Center mt="xl"><Loader /></Center>
      ) : !pagos?.length ? (
        <Text c="dimmed" ta="center" mt="xl">No tienes pagos registrados aun.</Text>
      ) : (
        <Table.ScrollContainer minWidth={700} mt="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Empresa</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Contador</Table.Th>
                <Table.Th>Periodo</Table.Th>
                <Table.Th>Monto</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Comprobante</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pagos.map((pago) => (
                <Table.Tr key={pago.id}>
                  <Table.Td>
                    <Text size="sm">{new Date(pago.fechaPago).toLocaleDateString('es-GT')}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>{pago.empresa.nombre}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{pago.empresa.tipoServicio?.nombre}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" ff="monospace">{pago.numeroContador}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{MESES[pago.mesCorrespondiente - 1]} {pago.anioCorrespondiente}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600}>Q{Number(pago.montoPagado).toFixed(2)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColor(pago.estado)} variant="light" size="sm">
                      {pago.estado}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" ff="monospace">{pago.comprobante?.numeroComprobante || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="Ver comprobante">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/dashboard/pagos/comprobante/${pago.id}`)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </>
  );
}
