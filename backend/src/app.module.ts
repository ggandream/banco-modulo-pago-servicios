import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { ServiciosModule } from './servicios/servicios.module';
import { PagosModule } from './pagos/pagos.module';
import { MetricsModule } from './metrics/metrics.module';
import { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';

@Module({
  imports: [
    PrismaModule,
    MetricsModule,
    AuthModule,
    UsersModule,
    CuentasModule,
    ServiciosModule,
    PagosModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class AppModule {}
