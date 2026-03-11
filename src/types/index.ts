export * from './intents.js';
export * from './enums.js';
export * from './payloads.js';

export interface ClientOptions {
  token: string;
  intents: number | number[];
  shardId?: number;
  shardCount?: number;
}

export interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  after: number;
  bucket: string;
}

export interface RESTOptions {
  baseURL?: string;
  version?: number;
  retries?: number;
  timeout?: number;
}

export interface APIRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  retryAfter?: number;
}
