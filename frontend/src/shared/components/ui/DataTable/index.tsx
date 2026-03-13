import {
  Table,
  Text,
  Center,
  Stack,
  Skeleton,
  UnstyledButton,
  Group,
} from '@mantine/core';
import { IconSelector, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { useState, useMemo, type ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: number | string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  keyExtractor,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null || bVal == null) return 0;
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (loading) {
    return (
      <Stack gap="xs">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={40} />
        ))}
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">{emptyMessage}</Text>
      </Center>
    );
  }

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <IconSelector size={14} />;
    if (sortDir === 'asc') return <IconChevronUp size={14} />;
    return <IconChevronDown size={14} />;
  };

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.key} w={col.width}>
                {col.sortable ? (
                  <UnstyledButton onClick={() => handleSort(col.key)}>
                    <Group gap={4} wrap="nowrap">
                      <Text fw={600} size="sm">
                        {col.label}
                      </Text>
                      <SortIcon colKey={col.key} />
                    </Group>
                  </UnstyledButton>
                ) : (
                  col.label
                )}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedData.map((item, idx) => (
            <Table.Tr
              key={keyExtractor ? keyExtractor(item) : idx}
              onClick={() => onRowClick?.(item)}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((col) => (
                <Table.Td key={col.key}>
                  {col.render
                    ? col.render(item)
                    : String(item[col.key] ?? '')}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
