import { useState } from 'react';
import { Table, Text, TextInput, Button, Group, Badge, Loader, Center, Alert } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { httpClient } from '@/lib/http/client';

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

interface PagoEmpresa {
  id: number;
  numeroContador: string;
  montoPagado: string;
  mesCorrespondiente: number;
  anioCorrespondiente: number;
  estado: string;
  fechaPago: string;
  comprobante: { numeroComprobante: string } | null;
}

export default function PagosEmpresaPage() {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [numeroContador, setNumeroContador] = useState('');
  const [buscar, setBuscar] = useState(false);

  // Obtener empresas para encontrar la del usuario empresa
  const { data: empresas } = useQuery({
    queryKey: ['empresas-all'],
    queryFn: () => httpClient.get<any[]>('/servicios/empresas'),
  });

  const selectedEmpresaId = empresaId || empresas?.[0]?.id;

  const { data: pagos, isLoading } = useQuery({
    queryKey: ['pagos-empresa', selectedEmpresaId, buscar ? numeroContador : ''],
    queryFn: () => {
      const params = numeroContador && buscar ? `?numeroContador=${numeroContador}` : '';
      return httpClient.get<PagoEmpresa[]>(`/pagos/empresa/${selectedEmpresaId}${params}`);
    },
    enabled: !!selectedEmpresaId,
  });

  return (
    <>
      <PageHeader title="Pagos Recibidos" subtitle="Consulta los pagos realizados a tu empresa" />

      {empresas && empresas.length > 1 && (
        <Group mt="md" gap="xs">
          {empresas.map((emp: any) => (
            <Button
              key={emp.id}
              variant={selectedEmpresaId === emp.id ? 'filled' : 'light'}
              size="xs"
              onClick={() => setEmpresaId(emp.id)}
            >
              {emp.nombre}
            </Button>
          ))}
        </Group>
      )}

      <Group mt="md">
        <TextInput
          placeholder="Buscar por numero de contador"
          leftSection={<IconSearch size={16} />}
          value={numeroContador}
          onChange={(e) => {
            setNumeroContador(e.target.value);
            if (!e.target.value) setBuscar(false);
          }}
          style={{ flex: 1, maxWidth: 400 }}
        />
        <Button onClick={() => setBuscar(true)} disabled={!numeroContador}>
          Buscar
        </Button>
        {buscar && (
          <Button variant="subtle" onClick={() => { setNumeroContador(''); setBuscar(false); }}>
            Limpiar
          </Button>
        )}
      </Group>

      {isLoading ? (
        <Center mt="xl"><Loader /></Center>
      ) : !pagos?.length ? (
        <Alert mt="md" color="gray">No se encontraron pagos.</Alert>
      ) : (
        <Table.ScrollContainer minWidth={600} mt="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>No. Contador</Table.Th>
                <Table.Th>Periodo</Table.Th>
                <Table.Th>Monto</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Comprobante</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pagos.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>
                    <Text size="sm">{new Date(p.fechaPago).toLocaleDateString('es-GT')}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" ff="monospace" fw={500}>{p.numeroContador}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{MESES[p.mesCorrespondiente - 1]} {p.anioCorrespondiente}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600}>Q{Number(p.montoPagado).toFixed(2)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={p.estado === 'aprobado' ? 'green' : 'yellow'} variant="light" size="sm">
                      {p.estado}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" ff="monospace">{p.comprobante?.numeroComprobante || '-'}</Text>
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
