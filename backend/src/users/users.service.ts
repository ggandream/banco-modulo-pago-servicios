import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      include: { rol: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });
  }

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.usuario.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        nombreUsuario: dto.nombreUsuario,
        correo: dto.correo,
        passwordHash: hash,
        rolId: dto.rolId,
      },
      include: { rol: true },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {
      ...(dto.nombreCompleto && { nombreCompleto: dto.nombreCompleto }),
      ...(dto.nombreUsuario && { nombreUsuario: dto.nombreUsuario }),
      ...(dto.correo && { correo: dto.correo }),
      ...(dto.rolId && { rolId: dto.rolId }),
      ...(dto.estado !== undefined && { estado: dto.estado }),
      fechaActualizacion: new Date(),
    };

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
      include: { rol: true },
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.update({
      where: { id },
      data: { estado: false, fechaActualizacion: new Date() },
    });
  }

  async getRoles() {
    return this.prisma.rol.findMany({ where: { estado: true } });
  }
}
