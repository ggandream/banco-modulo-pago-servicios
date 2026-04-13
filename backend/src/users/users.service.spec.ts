/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      usuario: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      rol: { findMany: jest.fn() },
    };
    service = new UsersService(prisma);
  });

  it('should return all users ordered by id desc', async () => {
    const users = [{ id: 2 }, { id: 1 }];
    prisma.usuario.findMany.mockResolvedValue(users);

    const result = await service.findAll();

    expect(result).toEqual(users);
    expect(prisma.usuario.findMany).toHaveBeenCalledWith({
      include: { rol: true },
      orderBy: { id: 'desc' },
    });
  });

  it('should find a user by id', async () => {
    const user = { id: 1, nombreUsuario: 'admin' };
    prisma.usuario.findUnique.mockResolvedValue(user);

    const result = await service.findOne(1);

    expect(result).toEqual(user);
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { rol: true },
    });
  });

  it('should create a user with hashed password', async () => {
    prisma.usuario.create.mockResolvedValue({ id: 1 });

    const dto = {
      nombreCompleto: 'Test User',
      nombreUsuario: 'testuser',
      correo: 'test@test.com',
      password: 'password123',
      rolId: 1,
    };

    await service.create(dto);

    const callData = prisma.usuario.create.mock.calls[0][0].data;
    expect(callData.nombreUsuario).toBe('testuser');
    expect(callData.passwordHash).toBeDefined();
    expect(callData.passwordHash).not.toBe('password123');
    const isValid = await bcrypt.compare('password123', callData.passwordHash);
    expect(isValid).toBe(true);
  });

  it('should soft-delete a user by setting estado to false', async () => {
    prisma.usuario.update.mockResolvedValue({ id: 1, estado: false });

    await service.remove(1);

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ estado: false }),
    });
  });

  it('should return active roles', async () => {
    const roles = [{ id: 1, nombre: 'admin' }];
    prisma.rol.findMany.mockResolvedValue(roles);

    const result = await service.getRoles();

    expect(result).toEqual(roles);
    expect(prisma.rol.findMany).toHaveBeenCalledWith({
      where: { estado: true },
    });
  });

  it('should update user and hash password if provided', async () => {
    prisma.usuario.update.mockResolvedValue({ id: 1 });

    await service.update(1, {
      nombreCompleto: 'Updated',
      password: 'newpass123',
    });

    const callData = prisma.usuario.update.mock.calls[0][0].data;
    expect(callData.nombreCompleto).toBe('Updated');
    expect(callData.passwordHash).toBeDefined();
    const isValid = await bcrypt.compare('newpass123', callData.passwordHash);
    expect(isValid).toBe(true);
  });
});
