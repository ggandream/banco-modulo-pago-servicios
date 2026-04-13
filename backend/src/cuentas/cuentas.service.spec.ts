/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CuentasService } from './cuentas.service';

describe('CuentasService', () => {
  let service: CuentasService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      cuentaBancaria: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    service = new CuentasService(prisma);
  });

  it('should find active accounts by user id', async () => {
    const cuentas = [{ id: 1, numeroCuenta: '1234' }];
    prisma.cuentaBancaria.findMany.mockResolvedValue(cuentas);

    const result = await service.findByUsuario(5);

    expect(result).toEqual(cuentas);
    expect(prisma.cuentaBancaria.findMany).toHaveBeenCalledWith({
      where: { usuarioId: 5, estado: true },
      orderBy: { id: 'asc' },
    });
  });

  it('should find a single account scoped by user', async () => {
    const cuenta = { id: 1, usuarioId: 5 };
    prisma.cuentaBancaria.findFirst.mockResolvedValue(cuenta);

    const result = await service.findOne(1, 5);

    expect(result).toEqual(cuenta);
    expect(prisma.cuentaBancaria.findFirst).toHaveBeenCalledWith({
      where: { id: 1, usuarioId: 5 },
    });
  });

  it('should return null when account not found', async () => {
    prisma.cuentaBancaria.findFirst.mockResolvedValue(null);

    const result = await service.findOne(999, 5);

    expect(result).toBeNull();
  });
});
