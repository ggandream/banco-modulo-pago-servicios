import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { ServiciosModule } from './servicios/servicios.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CuentasModule,
    ServiciosModule,
    PagosModule,
  ],
})
export class AppModule {}
