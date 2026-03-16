import { useState } from 'react';
import {
  Stepper,
  Card,
  Text,
  SimpleGrid,
  Group,
  Button,
  TextInput,
  Select,
  Stack,
  Alert,
  Badge,
  Checkbox,
  Paper,
  Title,
  Divider,
  ThemeIcon,
  Loader,
  Center,
} from '@mantine/core';
import { IconBolt, IconDroplet, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import {
  useTiposServicio,
  useEmpresas,
  useCuentas,
  useDeuda,
  useCrearPago,
} from '../api/pagos.api';
import type { EmpresaServicio, MesPendiente } from '../types/pagos.types';
import { useNavigate } from 'react-router-dom';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function NuevoPagoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tipoServicioId, setTipoServicioId] = useState<number | undefined>();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaServicio | null>(null);
  const [numeroContador, setNumeroContador] = useState('');
  const [contadorConfirmado, setContadorConfirmado] = useState(false);
  const [cuentaId, setCuentaId] = useState<string | null>(null);
  const [mesesSeleccionados, setMesesSeleccionados] = useState<MesPendiente[]>([]);
  const [pagoExitoso, setPagoExitoso] = useState<any>(null);

  const { data: tipos, isLoading: loadingTipos } = useTiposServicio();
  const { data: empresas, isLoading: loadingEmpresas } = useEmpresas(tipoServicioId);
  const { data: cuentas } = useCuentas();
  const { data: deuda, isLoading: loadingDeuda } = useDeuda(
    contadorConfirmado ? empresaSeleccionada?.id : undefined,
    contadorConfirmado ? numeroContador : '',
  );
  const crearPago = useCrearPago();

  const handleSeleccionarTipo = (id: number) => {
    setTipoServicioId(id);
    setStep(1);
  };

  const handleSeleccionarEmpresa = (empresa: EmpresaServicio) => {
    setEmpresaSeleccionada(empresa);
    setStep(2);
  };

  const handleConsultarDeuda = () => {
    if (!numeroContador.trim()) {
      notifications.show({ title: 'Error', message: 'Ingrese un numero de contador', color: 'red' });
      return;
    }
    setContadorConfirmado(true);
  };

  const toggleMes = (mes: MesPendiente) => {
    setMesesSeleccionados((prev) => {
      const exists = prev.find((m) => m.mes === mes.mes && m.anio === mes.anio);
      if (exists) return prev.filter((m) => !(m.mes === mes.mes && m.anio === mes.anio));
      return [...prev, mes];
    });
  };

  const seleccionarTodos = () => {
    if (deuda) {
      setMesesSeleccionados(
        mesesSeleccionados.length === deuda.mesesPendientes.length ? [] : [...deuda.mesesPendientes],
      );
    }
  };

  const montoTotal = mesesSeleccionados.length * (deuda?.tarifaMensual || 0);

  const handleConfirmarPago = async () => {
    if (!empresaSeleccionada || !cuentaId || mesesSeleccionados.length === 0) return;

    try {
      const resultado = await crearPago.mutateAsync({
        empresaId: empresaSeleccionada.id,
        numeroContador,
        cuentaBancariaId: Number(cuentaId),
        mesesAPagar: mesesSeleccionados,
      });
      setPagoExitoso(resultado);
      setStep(4);
    } catch (error: any) {
      notifications.show({
        title: 'Error al procesar el pago',
        message: error?.message || 'Ocurrio un error',
        color: 'red',
      });
    }
  };

  const tipoIcono = (nombre: string) =>
    nombre.toLowerCase().includes('electric') ? (
      <IconBolt size={40} stroke={1.5} />
    ) : (
      <IconDroplet size={40} stroke={1.5} />
    );

  return (
    <>
      <PageHeader title="Pagar Servicio" subtitle="Realiza el pago de servicios de electricidad y agua" />

      <Stepper active={step} onStepClick={(s) => s < step && setStep(s)} mt="md">
        {/* ================================================================== */}
        {/* PASO 0: Tipo de servicio */}
        {/* ================================================================== */}
        <Stepper.Step label="Tipo de servicio" description="Electricidad o Agua">
          {loadingTipos ? (
            <Center mt="xl"><Loader /></Center>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
              {tipos?.map((tipo) => (
                <Card
                  key={tipo.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSeleccionarTipo(tipo.id)}
                >
                  <Group>
                    <ThemeIcon size={60} variant="light" radius="md" color={tipo.nombre.includes('Elec') ? 'yellow' : 'blue'}>
                      {tipoIcono(tipo.nombre)}
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg">{tipo.nombre}</Text>
                      <Text size="sm" c="dimmed">Seleccionar para ver empresas disponibles</Text>
                    </div>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Stepper.Step>

        {/* ================================================================== */}
        {/* PASO 1: Seleccionar empresa */}
        {/* ================================================================== */}
        <Stepper.Step label="Empresa" description="Selecciona la empresa">
          {loadingEmpresas ? (
            <Center mt="xl"><Loader /></Center>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mt="md">
              {empresas?.map((emp) => (
                <Card
                  key={emp.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSeleccionarEmpresa(emp)}
                >
                  <Text fw={600}>{emp.nombre}</Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    Tarifa mensual: Q{Number(emp.tarifaMensual).toFixed(2)}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Stepper.Step>

        {/* ================================================================== */}
        {/* PASO 2: Numero de contador y deuda */}
        {/* ================================================================== */}
        <Stepper.Step label="Contador" description="Ingresa el numero de contador">
          <Stack mt="md" gap="md" maw={500}>
            <Paper p="md" withBorder radius="md">
              <Text fw={600} mb="xs">Empresa: {empresaSeleccionada?.nombre}</Text>
              <Text size="sm" c="dimmed">Tarifa mensual: Q{Number(empresaSeleccionada?.tarifaMensual || 0).toFixed(2)}</Text>
            </Paper>

            <TextInput
              label="Numero de contador"
              placeholder="Ej: CTR-E-001"
              value={numeroContador}
              onChange={(e) => {
                setNumeroContador(e.target.value);
                setContadorConfirmado(false);
              }}
            />

            <Button onClick={handleConsultarDeuda} loading={loadingDeuda}>
              Consultar deuda
            </Button>

            {contadorConfirmado && deuda && (
              <>
                {deuda.cantidadMesesPendientes === 0 ? (
                  <Alert color="green" icon={<IconCheck />}>
                    Este contador no tiene meses pendientes de pago.
                  </Alert>
                ) : (
                  <>
                    <Alert color="orange" icon={<IconAlertCircle />}>
                      {deuda.cantidadMesesPendientes} mes(es) pendiente(s) - Total: Q{deuda.montoTotal.toFixed(2)}
                    </Alert>

                    <Group justify="space-between">
                      <Text fw={500}>Selecciona los meses a pagar:</Text>
                      <Button variant="subtle" size="xs" onClick={seleccionarTodos}>
                        {mesesSeleccionados.length === deuda.mesesPendientes.length
                          ? 'Deseleccionar todos'
                          : 'Seleccionar todos'}
                      </Button>
                    </Group>

                    <Stack gap="xs">
                      {deuda.mesesPendientes.map((mp) => (
                        <Checkbox
                          key={`${mp.anio}-${mp.mes}`}
                          label={`${MESES[mp.mes - 1]} ${mp.anio} - Q${deuda.tarifaMensual.toFixed(2)}`}
                          checked={!!mesesSeleccionados.find((m) => m.mes === mp.mes && m.anio === mp.anio)}
                          onChange={() => toggleMes(mp)}
                        />
                      ))}
                    </Stack>

                    {mesesSeleccionados.length > 0 && (
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!mesesSeleccionados.length}
                      >
                        Continuar - Total: Q{montoTotal.toFixed(2)}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </Stack>
        </Stepper.Step>

        {/* ================================================================== */}
        {/* PASO 3: Confirmar pago */}
        {/* ================================================================== */}
        <Stepper.Step label="Confirmar" description="Revisa y confirma">
          <Stack mt="md" maw={500}>
            <Paper p="md" withBorder radius="md">
              <Title order={4} mb="sm">Resumen del pago</Title>
              <Divider mb="sm" />
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text c="dimmed">Empresa:</Text>
                  <Text fw={500}>{empresaSeleccionada?.nombre}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Contador:</Text>
                  <Text fw={500}>{numeroContador}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Meses a pagar:</Text>
                  <Text fw={500}>{mesesSeleccionados.length}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Tarifa por mes:</Text>
                  <Text fw={500}>Q{deuda?.tarifaMensual.toFixed(2)}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={600}>Total a pagar:</Text>
                  <Text fw={700} size="lg" c="blue">Q{montoTotal.toFixed(2)}</Text>
                </Group>
              </Stack>

              <Divider my="sm" />

              <Text size="sm" fw={500} mb="xs">Meses:</Text>
              <Group gap="xs">
                {mesesSeleccionados.map((m) => (
                  <Badge key={`${m.anio}-${m.mes}`} variant="light">
                    {MESES[m.mes - 1]} {m.anio}
                  </Badge>
                ))}
              </Group>
            </Paper>

            <Select
              label="Cuenta a debitar"
              placeholder="Selecciona una cuenta"
              value={cuentaId}
              onChange={setCuentaId}
              data={
                cuentas?.map((c) => ({
                  value: String(c.id),
                  label: `${c.numeroCuenta} - ${c.tipoCuenta} (Saldo: Q${Number(c.saldo).toFixed(2)})`,
                })) || []
              }
            />

            {cuentaId && (() => {
              const cuentaSel = cuentas?.find((c) => c.id === Number(cuentaId));
              if (cuentaSel && Number(cuentaSel.saldo) < montoTotal) {
                return (
                  <Alert color="red" icon={<IconAlertCircle />}>
                    Saldo insuficiente en esta cuenta.
                  </Alert>
                );
              }
              return null;
            })()}

            <Button
              size="lg"
              onClick={handleConfirmarPago}
              loading={crearPago.isPending}
              disabled={!cuentaId || (cuentas?.find((c) => c.id === Number(cuentaId)) && Number(cuentas.find((c) => c.id === Number(cuentaId))!.saldo) < montoTotal)}
            >
              Confirmar Pago
            </Button>
          </Stack>
        </Stepper.Step>

        {/* ================================================================== */}
        {/* PASO 4: Resultado */}
        {/* ================================================================== */}
        <Stepper.Completed>
          <Stack mt="md" align="center" gap="md">
            <ThemeIcon size={80} radius="xl" color="green" variant="light">
              <IconCheck size={40} />
            </ThemeIcon>
            <Title order={2} ta="center">Pago Exitoso</Title>
            <Text ta="center" c="dimmed">{pagoExitoso?.mensaje}</Text>

            <Paper p="md" withBorder radius="md" w="100%" maw={500}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text c="dimmed">Monto total:</Text>
                  <Text fw={700} c="green">Q{pagoExitoso?.montoTotal?.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Saldo restante:</Text>
                  <Text fw={500}>Q{pagoExitoso?.saldoRestante?.toFixed(2)}</Text>
                </Group>
                {pagoExitoso?.pagos?.map((p: any, i: number) => (
                  <Group key={i} justify="space-between">
                    <Text size="sm">Comprobante {i + 1}:</Text>
                    <Badge variant="light">{p.comprobante?.numeroComprobante}</Badge>
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Group>
              <Button variant="light" onClick={() => navigate('/dashboard/pagos/historial')}>
                Ver historial
              </Button>
              <Button onClick={() => {
                setStep(0);
                setTipoServicioId(undefined);
                setEmpresaSeleccionada(null);
                setNumeroContador('');
                setContadorConfirmado(false);
                setCuentaId(null);
                setMesesSeleccionados([]);
                setPagoExitoso(null);
              }}>
                Nuevo pago
              </Button>
            </Group>
          </Stack>
        </Stepper.Completed>
      </Stepper>
    </>
  );
}
