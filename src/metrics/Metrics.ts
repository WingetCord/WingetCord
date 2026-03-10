/**
 * Metrics System
 * Real-time performance monitoring
 */

/**
 * Metric types
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

/**
 * Metric value
 */
export interface MetricValue {
  type: MetricType;
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

/**
 * Counter metric
 */
export class Counter {
  private value = 0;
  public labels: Record<string, string>;

  constructor(
    public name: string,
    public help: string,
    labels: Record<string, string> = {}
  ) {
    this.labels = labels;
  }

  increment(amount = 1): void {
    this.value += amount;
  }

  reset(): void {
    this.value = 0;
  }

  getValue(): number {
    return this.value;
  }

  get(): MetricValue {
    return {
      type: MetricType.COUNTER,
      name: this.name,
      value: this.value,
      labels: this.labels,
      timestamp: Date.now(),
    };
  }
}

/**
 * Gauge metric
 */
export class Gauge {
  private value = 0;
  public labels: Record<string, string>;

  constructor(
    public name: string,
    public help: string,
    labels: Record<string, string> = {}
  ) {
    this.labels = labels;
  }

  set(value: number): void {
    this.value = value;
  }

  increment(amount = 1): void {
    this.value += amount;
  }

  decrement(amount = 1): void {
    this.value -= amount;
  }

  getValue(): number {
    return this.value;
  }

  get(): MetricValue {
    return {
      type: MetricType.GAUGE,
      name: this.name,
      value: this.value,
      labels: this.labels,
      timestamp: Date.now(),
    };
  }
}

/**
 * Histogram metric
 */
export class Histogram {
  private values: number[] = [];
  public labels: Record<string, string>;

  constructor(
    public name: string,
    public help: string,
    public buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    labels: Record<string, string> = {}
  ) {
    this.labels = labels;
  }

  observe(value: number): void {
    this.values.push(value);
  }

  getValue(): { count: number; sum: number; avg: number; p50: number; p95: number; p99: number } {
    if (this.values.length === 0) {
      return { count: 0, sum: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...this.values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const count = sorted.length;

    return {
      count,
      sum,
      avg: sum / count,
      p50: sorted[Math.floor(count * 0.5)] || 0,
      p95: sorted[Math.floor(count * 0.95)] || 0,
      p99: sorted[Math.floor(count * 0.99)] || 0,
    };
  }

  reset(): void {
    this.values = [];
  }

  get(): MetricValue {
    const stats = this.getValue();
    return {
      type: MetricType.HISTOGRAM,
      name: this.name,
      value: stats.avg,
      labels: this.labels,
      timestamp: Date.now(),
    };
  }
}

/**
 * Metrics registry
 */
export class MetricsRegistry {
  private counters = new Map<string, Counter>();
  private gauges = new Map<string, Gauge>();
  private histograms = new Map<string, Histogram>();

  /**
   * Get or create a counter
   */
  getOrCreateCounter(name: string, help: string, labels?: Record<string, string>): Counter {
    const key = this.getKey(name, labels);
    
    if (!this.counters.has(key)) {
      this.counters.set(key, new Counter(name, help, labels));
    }
    
    return this.counters.get(key)!;
  }

  /**
   * Get or create a gauge
   */
  getOrCreateGauge(name: string, help: string, labels?: Record<string, string>): Gauge {
    const key = this.getKey(name, labels);
    
    if (!this.gauges.has(key)) {
      this.gauges.set(key, new Gauge(name, help, labels));
    }
    
    return this.gauges.get(key)!;
  }

  /**
   * Get or create a histogram
   */
  getOrCreateHistogram(
    name: string,
    help: string,
    buckets?: number[],
    labels?: Record<string, string>
  ): Histogram {
    const key = this.getKey(name, labels);
    
    if (!this.histograms.has(key)) {
      this.histograms.set(key, new Histogram(name, help, buckets, labels));
    }
    
    return this.histograms.get(key)!;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): MetricValue[] {
    const metrics: MetricValue[] = [];
    
    for (const counter of this.counters.values()) {
      metrics.push(counter.get());
    }
    
    for (const gauge of this.gauges.values()) {
      metrics.push(gauge.get());
    }
    
    for (const histogram of this.histograms.values()) {
      metrics.push(histogram.get());
    }
    
    return metrics;
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusFormat(): string {
    const lines: string[] = [];
    
    for (const counter of this.counters.values()) {
      lines.push(`# HELP ${counter.name} ${counter.help}`);
      lines.push(`# TYPE ${counter.name} counter`);
      lines.push(`${counter.name}{${this.labelsToString(counter.labels)}} ${counter.getValue()}`);
    }
    
    for (const gauge of this.gauges.values()) {
      lines.push(`# HELP ${gauge.name} ${gauge.help}`);
      lines.push(`# TYPE ${gauge.name} gauge`);
      lines.push(`${gauge.name}{${this.labelsToString(gauge.labels)}} ${gauge.getValue()}`);
    }
    
    for (const histogram of this.histograms.values()) {
      const stats = histogram.getValue();
      lines.push(`# HELP ${histogram.name} ${histogram.help}`);
      lines.push(`# TYPE ${histogram.name} histogram`);
      lines.push(`${histogram.name}_count{${this.labelsToString(histogram.labels)}} ${stats.count}`);
      lines.push(`${histogram.name}_sum{${this.labelsToString(histogram.labels)}} ${stats.sum}`);
      lines.push(`${histogram.name}_avg{${this.labelsToString(histogram.labels)}} ${stats.avg}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    for (const counter of this.counters.values()) {
      counter.reset();
    }
    for (const histogram of this.histograms.values()) {
      histogram.reset();
    }
  }

  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels).sort().map(([k, v]) => `${k}="${v}"`).join(',');
    return `${name}{${labelStr}}`;
  }

  private labelsToString(labels: Record<string, string>): string {
    return Object.entries(labels).sort().map(([k, v]) => `${k}="${v}"`).join(',');
  }
}

/**
 * Default metrics registry
 */
export const metrics = new MetricsRegistry();

// Pre-defined metrics
export const commandCounter = metrics.getOrCreateCounter(
  'wingetcord_commands_total',
  'Total number of commands executed'
);

export const commandLatency = metrics.getOrCreateHistogram(
  'wingetcord_command_latency_seconds',
  'Command execution latency in seconds',
  [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
);

export const gatewayLatency = metrics.getOrCreateHistogram(
  'wingetcord_gateway_latency_seconds',
  'Gateway latency in seconds',
  [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
);

export const activeGuilds = metrics.getOrCreateGauge(
  'wingetcord_guilds_active',
  'Number of active guilds'
);

export const cacheHitRatio = metrics.getOrCreateGauge(
  'wingetcord_cache_hit_ratio',
  'Cache hit ratio'
);

export const memoryUsage = metrics.getOrCreateGauge(
  'wingetcord_memory_usage_bytes',
  'Memory usage in bytes'
);
