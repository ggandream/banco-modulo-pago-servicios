import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: { user: { id: number; role: string } }) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('roles')
  async getRoles() {
    return this.usersService.getRoles();
  }

  @Get()
  async findAll(@Req() req: { user: { id: number; role: string } }) {
    if (req.user.role !== 'administrador') {
      throw new ForbiddenException('Solo administradores');
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(
    @Req() req: { user: { id: number; role: string } },
    @Body() dto: CreateUserDto,
  ) {
    if (req.user.role !== 'administrador') {
      throw new ForbiddenException('Solo administradores');
    }
    return this.usersService.create(dto);
  }

  @Patch(':id')
  async update(
    @Req() req: { user: { id: number; role: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    if (req.user.role !== 'administrador') {
      throw new ForbiddenException('Solo administradores');
    }
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: { user: { id: number; role: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (req.user.role !== 'administrador') {
      throw new ForbiddenException('Solo administradores');
    }
    return this.usersService.remove(id);
  }
}
