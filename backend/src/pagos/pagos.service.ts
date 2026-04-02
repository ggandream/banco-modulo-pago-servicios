/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class PagosService {
  constructor(
    private prisma: PrismaService,
    private metrics: MetricsService,
  ) {}

  async calcularDeuda(empresaId: number, numeroContador: string) {
    const empresa = await this.prisma.empresaServicio.findUnique({
      where: { id: empresaId },
      include: { tipoServicio: true },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Obtener pagos aprobados para este contador y empresa
    const pagosAprobados = await this.prisma.pago.findMany({
      where: {
        empresaId,
        numeroContador,
        estado: 'aprobado',
      },
      select: {
        mesCorrespondiente: true,
        anioCorrespondiente: true,
      },
    });

    const mesesPagados = new Set(
      pagosAprobados.map(
        (p) => `${p.anioCorrespondiente}-${p.mesCorrespondiente}`,
      ),
    );

    // Calcular meses pendientes (desde enero 2026 hasta el mes actual)
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;

    const mesesPendientes: { mes: number; anio: number }[] = [];
    for (let anio = 2026; anio <= anioActual; anio++) {
      const mesInicio = anio === 2026 ? 1 : 1;
      const mesFin = anio === anioActual ? mesActual : 12;
      for (let mes = mesInicio; mes <= mesFin; mes++) {
        if (!mesesPagados.has(`${anio}-${mes}`)) {
          mesesPendientes.push({ mes, anio });
        }
      }
    }

    const tarifaMensual = Number(empresa.tarifaMensual);
    const montoTotal = tarifaMensual * mesesPendientes.length;

    return {
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        tipoServicio: empresa.tipoServicio.nombre,
      },
      numeroContador,
      tarifaMensual,
      mesesPendientes,
      cantidadMesesPendientes: mesesPendientes.length,
      montoTotal,
    };
  }

  async crearPago(usuarioId: number, dto: CreatePagoDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const paymentTimer = this.metrics.paymentDuration.startTimer();

    // Verificar que la cuenta pertenece al usuario
    const cuenta = await this.prisma.cuentaBancaria.findFirst({
      where: { id: dto.cuentaBancariaId, usuarioId, estado: true },
    });

    if (!cuenta) {
      throw new ForbiddenException(
        'Cuenta bancaria no encontrada o no pertenece al usuario',
      );
    }

    // Obtener empresa y tarifa
    const empresa = await this.prisma.empresaServicio.findUnique({
      where: { id: dto.empresaId },
      include: { tipoServicio: true },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const tarifaMensual = Number(empresa.tarifaMensual);
    const montoTotal = tarifaMensual * dto.mesesAPagar.length;

    // Validar saldo suficiente
    if (Number(cuenta.saldo) < montoTotal) {
      throw new BadRequestException(
        `Saldo insuficiente. Saldo: Q${Number(cuenta.saldo).toFixed(2)}, Monto requerido: Q${montoTotal.toFixed(2)}`,
      );
    }

    // Verificar que no existan pagos duplicados
    for (const mesPago of dto.mesesAPagar) {
      const existente = await this.prisma.pago.findUnique({
        where: {
          numeroContador_empresaId_mesCorrespondiente_anioCorrespondiente: {
            numeroContador: dto.numeroContador,
            empresaId: dto.empresaId,
            mesCorrespondiente: mesPago.mes,
            anioCorrespondiente: mesPago.anio,
          },
        },
      });

      if (existente) {
        throw new BadRequestException(
          `Ya existe un pago para ${mesPago.mes}/${mesPago.anio} del contador ${dto.numeroContador}`,
        );
      }
    }

    // Buscar contador (puede no existir en la tabla pero el pago se permite con el string)
    const contador = await this.prisma.contadorServicio.findUnique({
      where: { numeroContador: dto.numeroContador },
    });

    // Ejecutar transaccion
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Debitar cuenta
      await tx.cuentaBancaria.update({
        where: { id: cuenta.id },
        data: { saldo: new Prisma.Decimal(Number(cuenta.saldo) - montoTotal) },
      });

      const pagosCreados: any[] = [];

      for (const mesPago of dto.mesesAPagar) {
        // Crear pago
        const pago = await tx.pago.create({
          data: {
            usuarioId,
            empresaId: dto.empresaId,
            numeroContador: dto.numeroContador,
            cuentaBancariaId: dto.cuentaBancariaId,
            montoPagado: tarifaMensual,
            mesCorrespondiente: mesPago.mes,
            anioCorrespondiente: mesPago.anio,
            estado: 'aprobado',
          },
        });

        // Crear comprobante
        const comprobante = await tx.comprobante.create({
          data: {
            pagoId: pago.id,
            numeroComprobante: `COMP-${Date.now()}-${pago.id}`,
            monto: tarifaMensual,
            empresa: empresa.nombre,
            numeroContador: dto.numeroContador,
          },
        });

        // Registrar historial
        await tx.historialPagos.create({
          data: {
            pagoId: pago.id,
            empresaId: dto.empresaId,
            usuarioId,
            contadorId: contador?.id,
            tipoServicioId: empresa.tipoServicioId,
          },
        });

        pagosCreados.push({ ...pago, comprobante });
      }

      return pagosCreados;
    });

    // Record business metrics
    paymentTimer({ status: 'success' });
    this.metrics.paymentTotal.labels('success').inc(dto.mesesAPagar.length);
    this.metrics.paymentAmountTotal.inc(montoTotal);

    return {
      mensaje: `Pago exitoso. Se procesaron ${dto.mesesAPagar.length} mes(es) por un total de Q${montoTotal.toFixed(2)}`,
      pagos: resultado,
      montoTotal,
      saldoRestante: Number(cuenta.saldo) - montoTotal,
    };
  }

  async getHistorial(usuarioId: number, empresaId?: number) {
    return this.prisma.pago.findMany({
      where: {
        usuarioId,
        ...(empresaId && { empresaId }),
      },
      include: {
        empresa: { include: { tipoServicio: true } },
        comprobante: true,
        cuentaBancaria: { select: { numeroCuenta: true, tipoCuenta: true } },
      },
      orderBy: { fechaPago: 'desc' },
    });
  }

  async getComprobante(pagoId: number, usuarioId: number) {
    const pago = await this.prisma.pago.findFirst({
      where: { id: pagoId, usuarioId },
      include: {
        empresa: { include: { tipoServicio: true } },
        comprobante: true,
        cuentaBancaria: { select: { numeroCuenta: true } },
        usuario: { select: { nombreCompleto: true, nombreUsuario: true } },
      },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return pago;
  }

  async getPagosEmpresa(empresaId: number, numeroContador?: string) {
    return this.prisma.pago.findMany({
      where: {
        empresaId,
        ...(numeroContador && { numeroContador }),
      },
      select: {
        id: true,
        numeroContador: true,
        montoPagado: true,
        mesCorrespondiente: true,
        anioCorrespondiente: true,
        estado: true,
        fechaPago: true,
        comprobante: { select: { numeroComprobante: true } },
      },
      orderBy: { fechaPago: 'desc' },
    });
  }

  async getStatsUsuario(usuarioId: number) {
    const cuentas = await this.prisma.cuentaBancaria.findMany({
      where: { usuarioId, estado: true },
    });

    const saldoTotal = cuentas.reduce((acc, c) => acc + Number(c.saldo), 0);

    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const pagosDelMes = await this.prisma.pago.count({
      where: {
        usuarioId,
        mesCorrespondiente: mesActual,
        anioCorrespondiente: anioActual,
      },
    });

    const totalPagos = await this.prisma.pago.count({
      where: { usuarioId },
    });

    return {
      saldoTotal,
      pagosDelMes,
      totalPagos,
      cantidadCuentas: cuentas.length,
    };
  }

  async getStatsAdmin() {
    const totalUsuarios = await this.prisma.usuario.count();
    const totalPagos = await this.prisma.pago.count();

    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const pagosDelMes = await this.prisma.pago.findMany({
      where: {
        mesCorrespondiente: mesActual,
        anioCorrespondiente: anioActual,
      },
    });

    const montoMes = pagosDelMes.reduce(
      (acc, p) => acc + Number(p.montoPagado),
      0,
    );

    return {
      totalUsuarios,
      totalPagos,
      pagosDelMes: pagosDelMes.length,
      montoMes,
    };
  }

  async getStatsEmpresa(empresaId: number) {
    const totalPagos = await this.prisma.pago.count({
      where: { empresaId },
    });

    const pagos = await this.prisma.pago.findMany({
      where: { empresaId },
    });

    const montoTotal = pagos.reduce((acc, p) => acc + Number(p.montoPagado), 0);

    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const pagosDelMes = pagos.filter(
      (p) =>
        p.mesCorrespondiente === mesActual &&
        p.anioCorrespondiente === anioActual,
    );
    const montoMes = pagosDelMes.reduce(
      (acc, p) => acc + Number(p.montoPagado),
      0,
    );

    return {
      totalPagos,
      montoTotal,
      pagosDelMes: pagosDelMes.length,
      montoMes,
    };
  }
}
