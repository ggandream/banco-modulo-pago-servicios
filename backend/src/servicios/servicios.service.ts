import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async getTipos() {
    return this.prisma.tipoServicio.findMany({
      where: { estado: true },
      orderBy: { id: 'asc' },
    });
  }

  async getEmpresas(tipoServicioId?: number) {
    return this.prisma.empresaServicio.findMany({
      where: {
        estado: true,
        ...(tipoServicioId && { tipoServicioId }),
      },
      include: { tipoServicio: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getEmpresa(id: number) {
    return this.prisma.empresaServicio.findUnique({
      where: { id },
      include: {
        tipoServicio: true,
        tarifas: {
          where: { estado: true },
          orderBy: { fechaInicioVigencia: 'desc' },
          take: 1,
        },
      },
    });
  }

  async updateTarifa(empresaId: number, montoMensual: number) {
    // Desactivar tarifa anterior
    await this.prisma.tarifasServicio.updateMany({
      where: { empresaId, estado: true },
      data: { estado: false, fechaFinVigencia: new Date() },
    });

    // Crear nueva tarifa
    await this.prisma.tarifasServicio.create({
      data: {
        empresaId,
        montoMensual,
        fechaInicioVigencia: new Date(),
        estado: true,
      },
    });

    // Actualizar tarifa en la empresa
    return this.prisma.empresaServicio.update({
      where: { id: empresaId },
      data: { tarifaMensual: montoMensual, fechaActualizacion: new Date() },
    });
  }
}
