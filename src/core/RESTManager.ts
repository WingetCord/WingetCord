import { Pool } from 'undici';
import { Constants } from '../utils/Constants.js';
import { Logger } from './Logger.js';
import type { RateLimitData } from '../types/index.js';
import { UsersHandler } from '../rest/UsersHandler.js';
import { GuildsHandler } from '../rest/GuildsHandler.js';
import { ChannelsHandler } from '../rest/ChannelsHandler.js';
import { WebhooksHandler } from '../rest/WebhooksHandler.js';
import { CommandsHandler } from '../rest/CommandsHandler.js';
import type { Client } from './Client.js';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  endpoint: string;
  body?: any;
  retries?: number;
  useCache?: boolean;
}

export class RESTManager {
  private pool: Pool;
  private rateLimits: Map<string, RateLimitData> = new Map();
  private queue: Map<string, Promise<any>> = new Map();
  private MAX_RETRIES = 3;

  public users: UsersHandler;
  public guilds: GuildsHandler;
  public channels: ChannelsHandler;
  public webhooks: WebhooksHandler;
  public commands: CommandsHandler;

  constructor(private client: Client) {
    this.pool = new Pool(Constants.BASE_URL.replace('/api/v10', ''));

    this.users = new UsersHandler(this);
    this.guilds = new GuildsHandler(this);
    this.channels = new ChannelsHandler(this);
    this.webhooks = new WebhooksHandler(this);
    this.commands = new CommandsHandler(this);
  }

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

  async request(method: RequestOptions['method'], endpoint: string, body?: any, options: Partial<RequestOptions> = {}): Promise<any> {
    const route = this.getRoute(endpoint);
    const useCache = options.useCache ?? (method === 'GET');

    // 1. Check Cache for GET requests
    if (useCache && method === 'GET') {
      const cached = this.checkCache(endpoint);
      if (cached) return cached;
    }

    // 2. Queue management (Failure resilient)
    const currentQueue = this.queue.get(route) || Promise.resolve();
    const nextRequest = (async () => {
      try {
        await currentQueue;
      } catch (e) {
        // Proceed even if previous request failed
      }
      return this.execute(method, endpoint, body, options.retries || 0);
    })();

    this.queue.set(route, nextRequest);
    const result = await nextRequest;

    // 3. Update Cache on Success
    if (result) {
      this.updateCache(method, endpoint, result);
    }

    return result;
  }

  private async execute(method: string, endpoint: string, body?: any, retries = 0): Promise<any> {
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
        method: method as any,
        headers: {
          Authorization: `Bot ${this.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': Constants.USER_AGENT,
        },
        body: body ? JSON.stringify(body) : null,
      });

      // Update Rate Limits
      this.updateRateLimits(route, res.headers);

      if (res.statusCode === 429) {
        const data = await res.body.json() as any;
        const retryAfter = (data.retry_after * 1000) || 5000;
        Logger.error(`Rate Limit Hit [${route}]! Retry after ${retryAfter}ms`);
        await new Promise(r => setTimeout(r, retryAfter));
        return this.execute(method, endpoint, body, retries);
      }

      const responseBody = await res.body.json() as any;

      if (res.statusCode >= 400) {
        if (res.statusCode >= 500 && retries < this.MAX_RETRIES) {
          const backoff = Math.pow(2, retries) * 1000;
          Logger.warn(`Server error ${res.statusCode} on ${endpoint}, retrying in ${backoff}ms...`);
          await new Promise(r => setTimeout(r, backoff));
          return this.execute(method, endpoint, body, retries + 1);
        }
        throw new Error(`Discord API Error [${res.statusCode}]: ${responseBody.message} (${responseBody.code})`);
      }

      return responseBody;
    } catch (err) {
      if (retries < this.MAX_RETRIES) {
        const backoff = Math.pow(2, retries) * 1000;
        Logger.warn(`Request to ${endpoint} failed, retrying in ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
        return this.execute(method, endpoint, body, retries + 1);
      }
      throw err;
    }
  }

  private updateRateLimits(route: string, headers: any) {
    const limit = Number(headers['x-ratelimit-limit']);
    const remaining = Number(headers['x-ratelimit-remaining']);
    const reset = Number(headers['x-ratelimit-reset']) * 1000;

    if (!isNaN(limit)) {
      this.rateLimits.set(route, {
        limit,
        remaining,
        reset,
        after: reset - Date.now(),
        bucket: (headers['x-ratelimit-bucket'] as string) || route,
      });
    }
  }

  private checkCache(endpoint: string): any {
    if (endpoint.startsWith('/guilds/')) {
      const parts = endpoint.split('/');
      if (parts.length === 3) return this.client.cache.guilds.get(parts[2]!);
    }
    return null;
  }

  private updateCache(method: string, endpoint: string, data: any) {
    if (method === 'GET') {
      if (endpoint.startsWith('/guilds/') && endpoint.split('/').length === 3) {
        this.client.cache.guilds.set(data.id, data);
      }
    } else if (['POST', 'PATCH', 'DELETE'].includes(method)) {
      if (endpoint.startsWith('/guilds/')) {
        const guildId = endpoint.split('/')[2];
        if (guildId) {
          if (method === 'DELETE') this.client.cache.invalidateGuild(guildId);
          else if (method === 'PATCH' && endpoint.split('/').length === 3) this.client.cache.guilds.set(guildId, data);
        }
      }
    }
  }
}
