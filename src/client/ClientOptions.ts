/**
 * Client Options
 */

export interface ClientOptions {
  token: string;
  intents: number | number[];
  shardId?: number;
  shardCount?: number;
}
