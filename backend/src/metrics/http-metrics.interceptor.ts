/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';
import { Request, Response } from 'express';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          this.recordMetrics(req, res.statusCode, start);
        },
        error: (err) => {
          const statusCode = err.status || 500;
          this.recordMetrics(req, statusCode, start);
        },
      }),
    );
  }

  private recordMetrics(req: Request, statusCode: number, start: number) {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;

    this.metricsService.httpRequestDuration
      .labels(method, route, String(statusCode))
      .observe(duration);

    this.metricsService.httpRequestTotal
      .labels(method, route, String(statusCode))
      .inc();

    if (statusCode >= 400) {
      this.metricsService.httpErrorTotal
        .labels(method, route, String(statusCode))
        .inc();
    }
  }
}
