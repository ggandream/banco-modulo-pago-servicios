import { useState } from 'react';
import {
  Table,
  Badge,
  Button,
  Group,
  Modal,
  TextInput,
  Select,
  Stack,
  ActionIcon,
  Tooltip,
  Text,
  Loader,
  Center,
  PasswordInput,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { httpClient } from '@/lib/http/client';

interface Usuario {
  id: number;
  nombreCompleto: string;
  nombreUsuario: string;
  correo: string;
  estado: boolean;
  rol: { id: number; nombre: string };
}

interface Rol {
  id: number;
  nombre: string;
}

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  // Form state
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rolId, setRolId] = useState<string | null>(null);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => httpClient.get<Usuario[]>('/users'),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => httpClient.get<Rol[]>('/users/roles'),
  });

  const crearUsuario = useMutation({
    mutationFn: (data: any) => httpClient.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      cerrarModal();
      notifications.show({ title: 'Exito', message: 'Usuario creado', color: 'green' });
    },
    onError: (err: any) => {
      notifications.show({ title: 'Error', message: err?.message || 'Error al crear usuario', color: 'red' });
    },
  });

  const actualizarUsuario = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => httpClient.patch(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      cerrarModal();
      notifications.show({ title: 'Exito', message: 'Usuario actualizado', color: 'green' });
    },
    onError: (err: any) => {
      notifications.show({ title: 'Error', message: err?.message || 'Error al actualizar', color: 'red' });
    },
  });

  const eliminarUsuario = useMutation({
    mutationFn: (id: number) => httpClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      notifications.show({ title: 'Exito', message: 'Usuario desactivado', color: 'green' });
    },
  });

  const abrirCrear = () => {
    setEditando(null);
    setNombreCompleto('');
    setNombreUsuario('');
    setCorreo('');
    setPassword('');
    setRolId(null);
    setModalOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setNombreCompleto(u.nombreCompleto);
    setNombreUsuario(u.nombreUsuario);
    setCorreo(u.correo);
    setPassword('');
    setRolId(String(u.rol.id));
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  const handleSubmit = () => {
    if (editando) {
      const data: any = { nombreCompleto, nombreUsuario, correo, rolId: Number(rolId) };
      if (password) data.password = password;
      actualizarUsuario.mutate({ id: editando.id, data });
    } else {
      crearUsuario.mutate({
        nombreCompleto,
        nombreUsuario,
        correo,
        password,
        rolId: Number(rolId),
      });
    }
  };

  return (
    <>
      <PageHeader title="Gestion de Usuarios" subtitle="Administra los usuarios del sistema" />

      <Group justify="flex-end" mt="md">
        <Button leftSection={<IconPlus size={16} />} onClick={abrirCrear}>
          Nuevo usuario
        </Button>
      </Group>

      {isLoading ? (
        <Center mt="xl"><Loader /></Center>
      ) : (
        <Table.ScrollContainer minWidth={700} mt="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Usuario</Table.Th>
                <Table.Th>Correo</Table.Th>
                <Table.Th>Rol</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {usuarios?.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.id}</Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{u.nombreCompleto}</Text></Table.Td>
                  <Table.Td><Text size="sm" ff="monospace">{u.nombreUsuario}</Text></Table.Td>
                  <Table.Td><Text size="sm">{u.correo}</Text></Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={u.rol.nombre === 'administrador' ? 'red' : u.rol.nombre === 'cuentahabiente' ? 'blue' : 'orange'}>
                      {u.rol.nombre}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={u.estado ? 'green' : 'gray'} variant="dot">
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Editar">
                        <ActionIcon variant="subtle" onClick={() => abrirEditar(u)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Desactivar">
                        <ActionIcon variant="subtle" color="red" onClick={() => eliminarUsuario.mutate(u.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Modal opened={modalOpen} onClose={cerrarModal} title={editando ? 'Editar usuario' : 'Nuevo usuario'}>
        <Stack>
          <TextInput label="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
          <TextInput label="Nombre de usuario" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} required />
          <TextInput label="Correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          <PasswordInput
            label={editando ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editando}
          />
          <Select
            label="Rol"
            value={rolId}
            onChange={setRolId}
            data={roles?.map((r) => ({ value: String(r.id), label: r.nombre })) || []}
            required
          />
          <Button onClick={handleSubmit} loading={crearUsuario.isPending || actualizarUsuario.isPending}>
            {editando ? 'Actualizar' : 'Crear'}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
