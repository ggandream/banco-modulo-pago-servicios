import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Registry,
  Histogram,
  Counter,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private register: Registry;

  // HTTP metrics
  public httpRequestDuration: Histogram<string>;
  public httpRequestTotal: Counter<string>;
  public httpErrorTotal: Counter<string>;

  // Business metrics
  public paymentDuration: Histogram<string>;
  public paymentTotal: Counter<string>;
  public paymentAmountTotal: Gauge<string>;

  onModuleInit() {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });

    // -------------------------------------------------------------------------
    // HTTP Metrics
    // -------------------------------------------------------------------------
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpErrorTotal = new Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors (4xx and 5xx)',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    // -------------------------------------------------------------------------
    // Business Metrics (Pagos)
    // -------------------------------------------------------------------------
    this.paymentDuration = new Histogram({
      name: 'payment_processing_duration_seconds',
      help: 'Duration of payment processing in seconds',
      labelNames: ['status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.paymentTotal = new Counter({
      name: 'payments_total',
      help: 'Total number of payments processed',
      labelNames: ['status'],
      registers: [this.register],
    });

    this.paymentAmountTotal = new Gauge({
      name: 'payments_amount_quetzales',
      help: 'Total amount of payments in Quetzales',
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}
