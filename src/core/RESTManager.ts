import { Pool } from 'undici';
import { Constants } from '../utils/Constants.js';
import { Logger } from './Logger.js';
import type { RateLimitData } from '../types/index.js';
import { UsersHandler } from '../rest/UsersHandler.js';
import { GuildsHandler } from '../rest/GuildsHandler.js';
import { ChannelsHandler } from '../rest/ChannelsHandler.js';
import { WebhooksHandler } from '../rest/WebhooksHandler.js';
import { CommandsHandler } from '../rest/CommandsHandler.js';
import { AuditLogsHandler } from '../rest/AuditLogsHandler.js';
import { AutoModHandler } from '../rest/AutoModHandler.js';
import { ScheduledEventsHandler } from '../rest/ScheduledEventsHandler.js';
import { StickerHandler } from '../rest/StickerHandler.js';
import { EmojiHandler } from '../rest/EmojiHandler.js';
import type { Client } from './Client.js';

// Import type-safe route utilities
import { getRouteKey, type Route } from '../rest/types.js';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  endpoint: string;
  body?: unknown;
  retries?: number;
  useCache?: boolean;
}

/**
 * Enhanced RESTManager with type-safe methods
 * Maintains backward compatibility while adding new type-safe API
 */
export class RESTManager {
  private pool: Pool;
  private rateLimits = new Map<string, RateLimitData>();
  private queue = new Map<string, Promise<unknown>>();
  private readonly MAX_RETRIES = 3;
  private fastPath = false;

  users: UsersHandler;
  guilds: GuildsHandler;
  channels: ChannelsHandler;
  webhooks: WebhooksHandler;
  commands: CommandsHandler;
  auditLogs: AuditLogsHandler;
  autoMod: AutoModHandler;
  scheduledEvents: ScheduledEventsHandler;
  stickers: StickerHandler;
  emojis: EmojiHandler;

  constructor(private client: Client) {
    this.pool = new Pool(Constants.BASE_URL.replace('/api/v10', ''));

    this.users = new UsersHandler(this);
    this.guilds = new GuildsHandler(this);
    this.channels = new ChannelsHandler(this);
    this.webhooks = new WebhooksHandler(this);
    this.commands = new CommandsHandler(this);
    this.auditLogs = new AuditLogsHandler(this);
    this.autoMod = new AutoModHandler(this);
    this.scheduledEvents = new ScheduledEventsHandler(this);
    this.stickers = new StickerHandler(this);
    this.emojis = new EmojiHandler(this);
  }

  /**
   * Get route key for rate limiting
   */
  private getRoute(endpoint: string): string {
    const majorParams = ['guilds', 'channels', 'webhooks'];
    const parts = endpoint.split('/').filter(Boolean);
    let route = '';
    for (let i = 0; i < parts.length; i++) {
      if (majorParams.includes(parts[i]!) && parts[i + 1]) {
        route += `/${parts[i]}/${parts[i + 1]}`;
        i++;
      } else {
        route += `/${parts[i]}`;
      }
    }
    return route || '/';
  }

  // ============== Type-safe Methods ==============

  /**
   * Type-safe GET request
   */
  async get<T = unknown>(route: Route, query?: Record<string, string>): Promise<T> {
    let url = route;
    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }
    return this.request('GET', url, undefined, { useCache: true }) as Promise<T>;
  }

  /**
   * Type-safe POST request
   */
  async post<T = unknown>(route: Route, body?: unknown): Promise<T> {
    return this.request('POST', route, body) as Promise<T>;
  }

  /**
   * Type-safe PUT request
   */
  async put<T = unknown>(route: Route, body?: unknown): Promise<T> {
    return this.request('PUT', route, body) as Promise<T>;
  }

  /**
   * Type-safe PATCH request
   */
  async patch<T = unknown>(route: Route, body?: unknown): Promise<T> {
    return this.request('PATCH', route, body) as Promise<T>;
  }

  /**
   * Type-safe DELETE request
   */
  async delete<T = unknown>(route: Route): Promise<T> {
    return this.request('DELETE', route) as Promise<T>;
  }

  /**
   * Get rate limit info for a route
   */
  getRateLimitInfo(route: string): RateLimitData | undefined {
    const routeKey = getRouteKey('GET', route);
    return this.rateLimits.get(routeKey);
  }

  /**
   * Check if a route is rate limited
   */
  isRateLimited(route: string): boolean {
    const routeKey = getRouteKey('GET', route);
    const rl = this.rateLimits.get(routeKey);
    return !!(rl && rl.remaining === 0 && Date.now() < rl.reset);
  }

  /**
   * Get time until rate limit resets
   */
  getRateLimitReset(route: string): number {
    const routeKey = getRouteKey('GET', route);
    const rl = this.rateLimits.get(routeKey);
    if (rl && rl.remaining === 0 && Date.now() < rl.reset) {
      return rl.reset - Date.now();
    }
    return 0;
  }

  // ============== Legacy Methods (Backward Compatible) ==============

  async request(
    method: RequestOptions['method'],
    endpoint: string,
    body?: unknown,
    options: Partial<RequestOptions> = {}
  ): Promise<unknown> {
    const route = this.getRoute(endpoint);
    const useCache = options.useCache ?? method === 'GET';

    if (useCache && method === 'GET') {
      const cached = this.checkCache(endpoint);
      if (cached) return cached;
    }

    if (this.fastPath && method === 'GET') {
      return this.execute(method, endpoint, body, options.retries || 0);
    }

    const currentQueue = this.queue.get(route) || Promise.resolve();
    const nextRequest = (async () => {
      try {
        await currentQueue;
      } catch {
        // Proceed even if previous request failed
      }
      return this.execute(method, endpoint, body, options.retries || 0);
    })();

    this.queue.set(route, nextRequest);
    const result = await nextRequest;

    if (result) {
      this.updateCache(method, endpoint, result);
    }

    return result;
  }

  setFastPath(enabled: boolean) {
    this.fastPath = enabled;
  }

  private async execute(
    method: string,
    endpoint: string,
    body?: unknown,
    retries = 0
  ): Promise<unknown> {
    const route = this.getRoute(endpoint);
    const rl = this.rateLimits.get(route);

    if (rl && rl.remaining === 0 && Date.now() < rl.reset) {
      const wait = rl.reset - Date.now();
      Logger.warn(`Rate limit on ${route}, waiting ${wait}ms`);
      await new Promise(r => setTimeout(r, wait));
    }

    try {
      const res = await this.pool.request({
        path: `/api/v10${endpoint}`,
        method: method as 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
        headers: {
          Authorization: `Bot ${this.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': Constants.USER_AGENT,
        },
        body: body ? JSON.stringify(body) : null,
      });

      this.updateRateLimits(route, res.headers as Record<string, string>);

      if (res.statusCode === 429) {
        const data = (await res.body.json()) as { retry_after?: number };
        const retryAfter = data.retry_after! * 1000 || 5000;
        Logger.error(`Rate Limit Hit [${route}]! Retry after ${retryAfter}ms`);
        await new Promise(r => setTimeout(r, retryAfter));
        return this.execute(method, endpoint, body, retries);
      }

      const responseBody = await res.body.json();

      if (res.statusCode >= 400) {
        if (res.statusCode >= 500 && retries < this.MAX_RETRIES) {
          const backoff = Math.pow(2, retries) * 1000;
          Logger.warn(`Server error ${res.statusCode} on ${endpoint}, retrying in ${backoff}ms...`);
          await new Promise(r => setTimeout(r, backoff));
          return this.execute(method, endpoint, body, retries + 1);
        }
        const err = responseBody as { message: string; code: number };
        throw new Error(`Discord API Error [${res.statusCode}]: ${err.message} (${err.code})`);
      }

      return responseBody;
    } catch (err) {
      if (retries < this.MAX_RETRIES) {
        const backoff = Math.pow(2, retries) * 1000;
        const e = err as Error;
        Logger.warn(`Request to ${endpoint} failed (${e.message}), retrying in ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
        return this.execute(method, endpoint, body, retries + 1);
      }
      throw err;
    }
  }

  private updateRateLimits(route: string, headers: Record<string, string>) {
    const limit = Number(headers['x-ratelimit-limit']);
    const remaining = Number(headers['x-ratelimit-remaining']);
    const reset = Number(headers['x-ratelimit-reset']) * 1000;

    if (!isNaN(limit)) {
      this.rateLimits.set(route, {
        limit,
        remaining,
        reset,
        after: reset - Date.now(),
        bucket: headers['x-ratelimit-bucket'] || route,
      });
    }
  }

  private checkCache(endpoint: string): unknown {
    if (endpoint.startsWith('/guilds/')) {
      const parts = endpoint.split('/');
      if (parts.length === 3) return this.client.cache.guilds.get(parts[2]!);
    }
    return null;
  }

  private updateCache(method: string, endpoint: string, data: unknown) {
    if (method === 'GET') {
      if (endpoint.startsWith('/guilds/') && endpoint.split('/').length === 3) {
        const d = data as { id: string };
        this.client.cache.guilds.set(d.id, d as never);
      }
    } else if (['POST', 'PATCH', 'DELETE'].includes(method)) {
      if (endpoint.startsWith('/guilds/')) {
        const guildId = endpoint.split('/')[2];
        if (guildId) {
          if (method === 'DELETE') this.client.cache.invalidateGuild(guildId);
          else if (method === 'PATCH' && endpoint.split('/').length === 3) {
            const d = data as Record<string, unknown>;
            this.client.cache.guilds.set(guildId, d as never);
          }
        }
      }
    }
  }
}
