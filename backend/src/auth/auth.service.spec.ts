import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = {
      usuario: { findUnique: jest.fn() },
    };
    jwtService = { sign: jest.fn().mockReturnValue('mock-token') } as any;
    service = new AuthService(prisma, jwtService);
  });

  it('should return accessToken and user on valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 10);
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      correo: 'admin@test.com',
      nombreCompleto: 'Admin User',
      passwordHash: hash,
      estado: true,
      rol: { nombre: 'admin' },
    });

    const result = await service.login('admin', 'password123');

    expect(result.accessToken).toBe('mock-token');
    expect(result.user.username).toBe('admin');
    expect(result.user.role).toBe('admin');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 1,
      username: 'admin',
      role: 'admin',
    });
  });

  it('should throw UnauthorizedException if user not found', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(service.login('nouser', 'pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user is deactivated', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      passwordHash: 'hash',
      estado: false,
      rol: { nombre: 'admin' },
    });

    await expect(service.login('admin', 'pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException on wrong password', async () => {
    const hash = await bcrypt.hash('correct', 10);
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      passwordHash: hash,
      estado: true,
      rol: { nombre: 'admin' },
    });

    await expect(service.login('admin', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
