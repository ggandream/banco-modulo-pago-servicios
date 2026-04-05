import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServiciosService } from './servicios.service';

@Controller('servicios')
@UseGuards(JwtAuthGuard)
export class ServiciosController {
  constructor(private serviciosService: ServiciosService) {}

  @Get('tipos')
  async getTipos() {
    return this.serviciosService.getTipos();
  }

  @Get('empresas')
  async getEmpresas(@Query('tipoServicioId') tipoServicioId?: string) {
    return this.serviciosService.getEmpresas(
      tipoServicioId ? +tipoServicioId : undefined,
    );
  }

  @Get('empresas/:id')
  async getEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.getEmpresa(id);
  }

  @Patch('tarifas/:empresaId')
  async updateTarifa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Body('montoMensual') montoMensual: number,
  ) {
    return this.serviciosService.updateTarifa(empresaId, montoMensual);
  }
}
