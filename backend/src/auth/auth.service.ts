import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { nombreUsuario: username },
      include: { rol: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload = {
      sub: user.id,
      username: user.nombreUsuario,
      role: user.rol.nombre,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.nombreUsuario,
        email: user.correo,
        fullName: user.nombreCompleto,
        role: user.rol.nombre,
      },
    };
  }
}
