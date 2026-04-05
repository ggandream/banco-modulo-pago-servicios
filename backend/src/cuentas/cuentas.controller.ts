import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CuentasService } from './cuentas.service';

@Controller('cuentas')
@UseGuards(JwtAuthGuard)
export class CuentasController {
  constructor(private cuentasService: CuentasService) {}

  @Get()
  async findAll(@Req() req: { user: { id: number } }) {
    return this.cuentasService.findByUsuario(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cuentasService.findOne(id, req.user.id);
  }
}
