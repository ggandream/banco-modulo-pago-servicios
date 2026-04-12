/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ServiciosService } from './servicios.service';

describe('ServiciosService', () => {
  let service: ServiciosService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      tipoServicio: { findMany: jest.fn() },
      empresaServicio: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      tarifasServicio: { updateMany: jest.fn(), create: jest.fn() },
    };
    service = new ServiciosService(prisma);
  });

  it('should return active service types', async () => {
    const tipos = [{ id: 1, nombre: 'Agua' }];
    prisma.tipoServicio.findMany.mockResolvedValue(tipos);

    const result = await service.getTipos();

    expect(result).toEqual(tipos);
    expect(prisma.tipoServicio.findMany).toHaveBeenCalledWith({
      where: { estado: true },
      orderBy: { id: 'asc' },
    });
  });

  it('should return companies filtered by service type', async () => {
    const empresas = [{ id: 1, nombre: 'EEGSA' }];
    prisma.empresaServicio.findMany.mockResolvedValue(empresas);

    const result = await service.getEmpresas(2);

    expect(result).toEqual(empresas);
    expect(prisma.empresaServicio.findMany).toHaveBeenCalledWith({
      where: { estado: true, tipoServicioId: 2 },
      include: { tipoServicio: true },
      orderBy: { nombre: 'asc' },
    });
  });

  it('should return all active companies when no filter', async () => {
    prisma.empresaServicio.findMany.mockResolvedValue([]);

    await service.getEmpresas();

    expect(prisma.empresaServicio.findMany).toHaveBeenCalledWith({
      where: { estado: true },
      include: { tipoServicio: true },
      orderBy: { nombre: 'asc' },
    });
  });

  it('should get a single company with tariffs', async () => {
    const empresa = { id: 1, nombre: 'EEGSA', tarifas: [] };
    prisma.empresaServicio.findUnique.mockResolvedValue(empresa);

    const result = await service.getEmpresa(1);

    expect(result).toEqual(empresa);
    expect(prisma.empresaServicio.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        tipoServicio: true,
        tarifas: {
          where: { estado: true },
          orderBy: { fechaInicioVigencia: 'desc' },
          take: 1,
        },
      },
    });
  });

  it('should update tariff: deactivate old, create new, update company', async () => {
    prisma.tarifasServicio.updateMany.mockResolvedValue({ count: 1 });
    prisma.tarifasServicio.create.mockResolvedValue({ id: 1 });
    prisma.empresaServicio.update.mockResolvedValue({
      id: 5,
      tarifaMensual: 150,
    });

    const result = await service.updateTarifa(5, 150);

    expect(prisma.tarifasServicio.updateMany).toHaveBeenCalledWith({
      where: { empresaId: 5, estado: true },
      data: expect.objectContaining({ estado: false }),
    });
    expect(prisma.tarifasServicio.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        empresaId: 5,
        montoMensual: 150,
        estado: true,
      }),
    });
    expect(prisma.empresaServicio.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: expect.objectContaining({ tarifaMensual: 150 }),
    });
    expect(result.tarifaMensual).toBe(150);
  });
});
