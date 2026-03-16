import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/http/client';
import type {
  TipoServicio,
  EmpresaServicio,
  CuentaBancaria,
  DeudaResponse,
  PagoResponse,
  CreatePagoResult,
  StatsUsuario,
  StatsAdmin,
} from '../types/pagos.types';

export function useTiposServicio() {
  return useQuery({
    queryKey: ['tipos-servicio'],
    queryFn: () => httpClient.get<TipoServicio[]>('/servicios/tipos'),
  });
}

export function useEmpresas(tipoServicioId?: number) {
  return useQuery({
    queryKey: ['empresas', tipoServicioId],
    queryFn: () =>
      httpClient.get<EmpresaServicio[]>(`/servicios/empresas?tipoServicioId=${tipoServicioId}`),
    enabled: !!tipoServicioId,
  });
}

export function useCuentas() {
  return useQuery({
    queryKey: ['cuentas'],
    queryFn: () => httpClient.get<CuentaBancaria[]>('/cuentas'),
  });
}

export function useDeuda(empresaId: number | undefined, numeroContador: string) {
  return useQuery({
    queryKey: ['deuda', empresaId, numeroContador],
    queryFn: () =>
      httpClient.get<DeudaResponse>(
        `/pagos/deuda?empresaId=${empresaId}&numeroContador=${numeroContador}`,
      ),
    enabled: !!empresaId && numeroContador.length > 0,
  });
}

export function useCrearPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      empresaId: number;
      numeroContador: string;
      cuentaBancariaId: number;
      mesesAPagar: { mes: number; anio: number }[];
    }) => httpClient.post<CreatePagoResult>('/pagos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuentas'] });
      queryClient.invalidateQueries({ queryKey: ['historial'] });
      queryClient.invalidateQueries({ queryKey: ['deuda'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useHistorial(empresaId?: number) {
  const params = empresaId ? `?empresaId=${empresaId}` : '';
  return useQuery({
    queryKey: ['historial', empresaId],
    queryFn: () => httpClient.get<PagoResponse[]>(`/pagos/historial${params}`),
  });
}

export function useComprobante(pagoId: number) {
  return useQuery({
    queryKey: ['comprobante', pagoId],
    queryFn: () => httpClient.get<PagoResponse>(`/pagos/comprobante/${pagoId}`),
    enabled: !!pagoId,
  });
}

export function useStatsUsuario() {
  return useQuery({
    queryKey: ['stats', 'usuario'],
    queryFn: () => httpClient.get<StatsUsuario>('/pagos/stats/usuario'),
  });
}

export function useStatsAdmin() {
  return useQuery({
    queryKey: ['stats', 'admin'],
    queryFn: () => httpClient.get<StatsAdmin>('/pagos/stats/admin'),
  });
}
