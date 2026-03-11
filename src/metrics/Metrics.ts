/**
 * Metrics - Prometheus-style metrics
 */

export class Counter {
  private counts = new Map<string, number>();

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  inc(labels: Record<string, string> = {}, value = 1): void {
    const key = this.labelsToKey(labels);
    this.counts.set(key, (this.counts.get(key) ?? 0) + value);
  }

  get(labels: Record<string, string> = {}): number {
    return this.counts.get(this.labelsToKey(labels)) ?? 0;
  }

  reset(): void {
    this.counts.clear();
  }

  private labelsToKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort()
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }
}

export class Gauge {
  private values = new Map<string, number>();

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  set(value: number, labels: Record<string, string> = {}): void {
    this.values.set(this.labelsToKey(labels), value);
  }

  inc(labels: Record<string, string> = {}, value = 1): void {
    const key = this.labelsToKey(labels);
    this.values.set(key, (this.values.get(key) ?? 0) + value);
  }

  dec(labels: Record<string, string> = {}, value = 1): void {
    this.inc(labels, -value);
  }

  get(labels: Record<string, string> = {}): number {
    return this.values.get(this.labelsToKey(labels)) ?? 0;
  }

  private labelsToKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort()
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }
}

export class Histogram {
  private observations: number[] = [];

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  ) {}

  observe(value: number): void {
    this.observations.push(value);
  }

  percentile(p: number): number {
    if (this.observations.length === 0) return 0;
    const sorted = [...this.observations].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }

  reset(): void {
    this.observations = [];
  }

  get count(): number {
    return this.observations.length;
  }

  get sum(): number {
    return this.observations.reduce((a, b) => a + b, 0);
  }
}

export class MetricsRegistry {
  private counters = new Map<string, Counter>();
  private gauges = new Map<string, Gauge>();
  private histograms = new Map<string, Histogram>();

  createCounter(options: { name: string; help: string }): Counter {
    const c = new Counter(options.name, options.help);
    this.counters.set(options.name, c);
    return c;
  }

  createGauge(options: { name: string; help: string }): Gauge {
    const g = new Gauge(options.name, options.help);
    this.gauges.set(options.name, g);
    return g;
  }

  createHistogram(options: { name: string; help: string; buckets?: number[] }): Histogram {
    const h = new Histogram(options.name, options.help, options.buckets);
    this.histograms.set(options.name, h);
    return h;
  }

  getCounter(name: string): Counter | undefined {
    return this.counters.get(name);
  }

  getGauge(name: string): Gauge | undefined {
    return this.gauges.get(name);
  }

  getHistogram(name: string): Histogram | undefined {
    return this.histograms.get(name);
  }
}

// Global metrics registry
export const globalMetrics = new MetricsRegistry();
