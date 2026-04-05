export interface TipoServicio {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface EmpresaServicio {
  id: number;
  nombre: string;
  tipoServicioId: number;
  tarifaMensual: string;
  tipoServicio?: TipoServicio;
}

export interface CuentaBancaria {
  id: number;
  numeroCuenta: string;
  saldo: string;
  tipoCuenta: string;
  estado: boolean;
}

export interface MesPendiente {
  mes: number;
  anio: number;
}

export interface DeudaResponse {
  empresa: {
    id: number;
    nombre: string;
    tipoServicio: string;
  };
  numeroContador: string;
  tarifaMensual: number;
  mesesPendientes: MesPendiente[];
  cantidadMesesPendientes: number;
  montoTotal: number;
}

export interface PagoResponse {
  id: number;
  usuarioId: number;
  empresaId: number;
  numeroContador: string;
  cuentaBancariaId: number;
  montoPagado: string;
  mesCorrespondiente: number;
  anioCorrespondiente: number;
  estado: string;
  fechaPago: string;
  empresa: EmpresaServicio & { tipoServicio: TipoServicio };
  comprobante: {
    id: number;
    numeroComprobante: string;
    fechaEmision: string;
    monto: string;
    empresa: string;
    numeroContador: string;
  } | null;
  cuentaBancaria?: {
    numeroCuenta: string;
    tipoCuenta: string;
  };
  usuario?: {
    nombreCompleto: string;
  };
}

export interface PagoResultItem {
  comprobante?: {
    numeroComprobante: string;
  };
}

export interface CreatePagoResult {
  mensaje: string;
  pagos: PagoResultItem[];
  montoTotal: number;
  saldoRestante: number;
}

export interface StatsUsuario {
  saldoTotal: number;
  pagosDelMes: number;
  totalPagos: number;
  cantidadCuentas: number;
}

export interface StatsAdmin {
  totalUsuarios: number;
  totalPagos: number;
  pagosDelMes: number;
  montoMes: number;
}

export interface StatsEmpresa {
  totalPagos: number;
  montoTotal: number;
  pagosDelMes: number;
  montoMes: number;
}
