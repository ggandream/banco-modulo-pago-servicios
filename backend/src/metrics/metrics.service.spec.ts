import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
    service.onModuleInit();
  });

  it('should initialize all HTTP metrics', () => {
    expect(service.httpRequestDuration).toBeDefined();
    expect(service.httpRequestTotal).toBeDefined();
    expect(service.httpErrorTotal).toBeDefined();
  });

  it('should initialize all business metrics', () => {
    expect(service.paymentDuration).toBeDefined();
    expect(service.paymentTotal).toBeDefined();
    expect(service.paymentAmountTotal).toBeDefined();
  });

  it('should return metrics as string', async () => {
    const metrics = await service.getMetrics();
    expect(typeof metrics).toBe('string');
    expect(metrics.length).toBeGreaterThan(0);
  });

  it('should return prometheus content type', () => {
    const contentType = service.getContentType();
    expect(contentType).toContain('text/plain');
  });

  it('should record HTTP request duration', () => {
    const observe = jest.fn();
    jest
      .spyOn(service.httpRequestDuration, 'labels')
      .mockReturnValue({ observe } as any);

    service.httpRequestDuration.labels('GET', '/api/test', '200').observe(0.5);

    expect(observe).toHaveBeenCalledWith(0.5);
  });

  it('should increment payment total counter', () => {
    const inc = jest.fn();
    jest
      .spyOn(service.paymentTotal, 'labels')
      .mockReturnValue({ inc } as any);

    service.paymentTotal.labels('success').inc(1);

    expect(inc).toHaveBeenCalledWith(1);
  });
});
