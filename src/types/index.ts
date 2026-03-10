import { IntentBits } from '../utils/Constants.js';

export interface ClientOptions {
  token: string;
  intents: number | (keyof typeof IntentBits)[];
  shardId?: number;
  shardCount?: number;
}

export interface GatewayPayload {
  op: number;
  d: any;
  s?: number | null;
  t?: string;
}

export interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  after: number;
  bucket: string;
}
