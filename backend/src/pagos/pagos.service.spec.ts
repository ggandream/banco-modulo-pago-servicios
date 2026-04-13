/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PagosService } from './pagos.service';

describe('PagosService', () => {
  let service: PagosService;
  let prisma: any;
  let metrics: any;

  beforeEach(() => {
    prisma = {
      empresaServicio: { findUnique: jest.fn() },
      pago: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      cuentaBancaria: { findFirst: jest.fn(), findMany: jest.fn() },
      contadorServicio: { findUnique: jest.fn() },
      usuario: { count: jest.fn() },
      $transaction: jest.fn(),
    };
    metrics = {
      paymentDuration: { startTimer: jest.fn().mockReturnValue(jest.fn()) },
      paymentTotal: { labels: jest.fn().mockReturnValue({ inc: jest.fn() }) },
      paymentAmountTotal: { inc: jest.fn() },
    };
    service = new PagosService(prisma, metrics);
  });

  describe('calcularDeuda', () => {
    it('should throw NotFoundException when empresa not found', async () => {
      prisma.empresaServicio.findUnique.mockResolvedValue(null);

      await expect(service.calcularDeuda(999, 'C-001')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate pending months and total debt', async () => {
      prisma.empresaServicio.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'EEGSA',
        tarifaMensual: 100,
        tipoServicio: { nombre: 'Electricidad' },
      });
      prisma.pago.findMany.mockResolvedValue([
        { mesCorrespondiente: 1, anioCorrespondiente: 2026 },
      ]);

      const result = await service.calcularDeuda(1, 'C-001');

      expect(result.empresa.nombre).toBe('EEGSA');
      expect(result.tarifaMensual).toBe(100);
      expect(result.numeroContador).toBe('C-001');
      // January 2026 is paid, so it should not be in pending months
      const hasJan2026 = result.mesesPendientes.some(
        (m: any) => m.mes === 1 && m.anio === 2026,
      );
      expect(hasJan2026).toBe(false);
      expect(result.montoTotal).toBe(
        result.tarifaMensual * result.mesesPendientes.length,
      );
    });
  });

  describe('crearPago', () => {
    it('should throw ForbiddenException when account not found', async () => {
      prisma.cuentaBancaria.findFirst.mockResolvedValue(null);

      const dto = {
        empresaId: 1,
        numeroContador: 'C-001',
        cuentaBancariaId: 99,
        mesesAPagar: [{ mes: 1, anio: 2026 }],
      };

      await expect(service.crearPago(1, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when empresa not found', async () => {
      prisma.cuentaBancaria.findFirst.mockResolvedValue({
        id: 1,
        saldo: 1000,
      });
      prisma.empresaServicio.findUnique.mockResolvedValue(null);

      const dto = {
        empresaId: 999,
        numeroContador: 'C-001',
        cuentaBancariaId: 1,
        mesesAPagar: [{ mes: 1, anio: 2026 }],
      };

      await expect(service.crearPago(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on insufficient balance', async () => {
      prisma.cuentaBancaria.findFirst.mockResolvedValue({
        id: 1,
        saldo: 50,
      });
      prisma.empresaServicio.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'EEGSA',
        tarifaMensual: 100,
        tipoServicio: { nombre: 'Electricidad' },
      });

      const dto = {
        empresaId: 1,
        numeroContador: 'C-001',
        cuentaBancariaId: 1,
        mesesAPagar: [{ mes: 1, anio: 2026 }],
      };

      await expect(service.crearPago(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on duplicate payment', async () => {
      prisma.cuentaBancaria.findFirst.mockResolvedValue({
        id: 1,
        saldo: 1000,
      });
      prisma.empresaServicio.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'EEGSA',
        tarifaMensual: 100,
        tipoServicioId: 1,
        tipoServicio: { nombre: 'Electricidad' },
      });
      prisma.pago.findUnique.mockResolvedValue({ id: 1 }); // already exists

      const dto = {
        empresaId: 1,
        numeroContador: 'C-001',
        cuentaBancariaId: 1,
        mesesAPagar: [{ mes: 1, anio: 2026 }],
      };

      await expect(service.crearPago(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getComprobante', () => {
    it('should throw NotFoundException when pago not found', async () => {
      prisma.pago.findFirst.mockResolvedValue(null);

      await expect(service.getComprobante(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return pago with comprobante', async () => {
      const pago = { id: 1, comprobante: { numeroComprobante: 'COMP-1' } };
      prisma.pago.findFirst.mockResolvedValue(pago);

      const result = await service.getComprobante(1, 1);

      expect(result).toEqual(pago);
    });
  });

  describe('getStatsUsuario', () => {
    it('should calculate user stats correctly', async () => {
      prisma.cuentaBancaria.findMany.mockResolvedValue([
        { saldo: 500 },
        { saldo: 300 },
      ]);
      prisma.pago.count
        .mockResolvedValueOnce(3) // pagosDelMes
        .mockResolvedValueOnce(10); // totalPagos

      const result = await service.getStatsUsuario(1);

      expect(result.saldoTotal).toBe(800);
      expect(result.cantidadCuentas).toBe(2);
      expect(result.pagosDelMes).toBe(3);
      expect(result.totalPagos).toBe(10);
    });
  });

  describe('getStatsAdmin', () => {
    it('should return admin stats', async () => {
      prisma.usuario.count.mockResolvedValue(50);
      prisma.pago.count.mockResolvedValue(200);
      prisma.pago.findMany.mockResolvedValue([
        { montoPagado: 100 },
        { montoPagado: 200 },
      ]);

      const result = await service.getStatsAdmin();

      expect(result.totalUsuarios).toBe(50);
      expect(result.totalPagos).toBe(200);
      expect(result.pagosDelMes).toBe(2);
      expect(result.montoMes).toBe(300);
    });
  });

  describe('getStatsEmpresa', () => {
    it('should return company stats', async () => {
      prisma.pago.count.mockResolvedValue(15);
      prisma.pago.findMany.mockResolvedValue([
        { montoPagado: 100, mesCorrespondiente: 1, anioCorrespondiente: 2025 },
        { montoPagado: 200, mesCorrespondiente: 2, anioCorrespondiente: 2025 },
      ]);

      const result = await service.getStatsEmpresa(1);

      expect(result.totalPagos).toBe(15);
      expect(result.montoTotal).toBe(300);
    });
  });
});
