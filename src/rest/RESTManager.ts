/**
 * REST Manager - undici Pool + rate limit orchestration
 */
import { Pool } from 'undici';
import { BASE_URL, USER_AGENT, MAX_RATE_LIMIT_RETRIES } from '../gateway/GatewayConstants.js';
import { RateLimitError, RESTError } from '../errors/WingetCordError.js';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  body?: unknown;
}

export class RESTManager {
  private pool: Pool;
  private token: string = '';
  private rateLimits = new Map<string, { limit: number; remaining: number; reset: number }>();

  constructor(token?: string) {
    this.pool = new Pool(BASE_URL);
    if (token) this.token = token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const routeKey = `${options.method}:${options.path}`;
    await this.waitForRateLimit(routeKey);

    const response = await this.pool.request({
      path: options.path,
      method: options.method,
      headers: {
        Authorization: `Bot ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: options.body ? JSON.stringify(options.body) : null,
    });

    this.updateRateLimit(routeKey, response.headers as Record<string, string>);

    if (response.statusCode === 429) {
      const data = (await response.body.json()) as { retry_after?: number };
      const retryAfter = (data.retry_after ?? 1) * 1000;
      throw new RateLimitError(`Rate limited on ${options.path}`, 429, options.path, retryAfter);
    }

    if (response.statusCode >= 400) {
      const data = await response.body.json();
      throw new RESTError(`HTTP ${response.statusCode}`, response.statusCode, options.path, data);
    }

    if (response.statusCode === 204) return undefined as T;
    return response.body.json() as Promise<T>;
  }

  private async waitForRateLimit(routeKey: string): Promise<void> {
    const limit = this.rateLimits.get(routeKey);
    if (limit && limit.remaining === 0 && Date.now() < limit.reset) {
      const wait = limit.reset - Date.now();
      await new Promise(r => setTimeout(r, wait));
    }
  }

  private updateRateLimit(routeKey: string, headers: Record<string, string>): void {
    const limit = Number(headers['x-ratelimit-limit']);
    const remaining = Number(headers['x-ratelimit-remaining']);
    const reset = Number(headers['x-ratelimit-reset']) * 1000;

    if (!isNaN(limit)) {
      this.rateLimits.set(routeKey, { limit, remaining, reset });
    }
  }

  // HTTP method helpers
  async get<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'GET', path });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }
}
