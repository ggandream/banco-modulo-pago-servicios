import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Controller('pagos')
@UseGuards(JwtAuthGuard)
export class PagosController {
  constructor(private pagosService: PagosService) {}

  @Get('deuda')
  async calcularDeuda(
    @Query('empresaId') empresaId: string,
    @Query('numeroContador') numeroContador: string,
  ) {
    return this.pagosService.calcularDeuda(+empresaId, numeroContador);
  }

  @Post()
  async crearPago(
    @Req() req: { user: { id: number } },
    @Body() dto: CreatePagoDto,
  ) {
    return this.pagosService.crearPago(req.user.id, dto);
  }

  @Get('historial')
  async getHistorial(
    @Req() req: { user: { id: number } },
    @Query('empresaId') empresaId?: string,
  ) {
    return this.pagosService.getHistorial(
      req.user.id,
      empresaId ? +empresaId : undefined,
    );
  }

  @Get('comprobante/:pagoId')
  async getComprobante(
    @Req() req: { user: { id: number } },
    @Param('pagoId', ParseIntPipe) pagoId: number,
  ) {
    return this.pagosService.getComprobante(pagoId, req.user.id);
  }

  @Get('empresa/:empresaId')
  async getPagosEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Query('numeroContador') numeroContador?: string,
  ) {
    return this.pagosService.getPagosEmpresa(empresaId, numeroContador);
  }

  @Get('stats/usuario')
  async getStatsUsuario(@Req() req: { user: { id: number } }) {
    return this.pagosService.getStatsUsuario(req.user.id);
  }

  @Get('stats/admin')
  async getStatsAdmin() {
    return this.pagosService.getStatsAdmin();
  }

  @Get('stats/empresa/:empresaId')
  async getStatsEmpresa(@Param('empresaId', ParseIntPipe) empresaId: number) {
    return this.pagosService.getStatsEmpresa(empresaId);
  }
}
