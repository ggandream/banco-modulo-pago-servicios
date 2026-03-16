import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CuentasService {
  constructor(private prisma: PrismaService) {}

  async findByUsuario(usuarioId: number) {
    return this.prisma.cuentaBancaria.findMany({
      where: { usuarioId, estado: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number, usuarioId: number) {
    return this.prisma.cuentaBancaria.findFirst({
      where: { id, usuarioId },
    });
  }
}
