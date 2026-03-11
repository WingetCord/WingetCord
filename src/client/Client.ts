/**
 * Client - Main entry point for WingetCord
 */
import { EventEmitter } from 'events';
import { CacheManager } from '../cache/CacheManager.js';
import { Scheduler } from '../scheduler/Scheduler.js';
import { MetricsRegistry, globalMetrics } from '../metrics/Metrics.js';
import type { ClientOptions } from './ClientOptions.js';
import { calculateIntents, type IntentBit } from '../types/intents.js';
import { RESTManager } from '../core/RESTManager.js';

export class Client extends EventEmitter {
  public readonly token: string;
  public readonly intents: number;
  public readonly cache: CacheManager;
  public readonly scheduler: Scheduler;
  public readonly metrics: MetricsRegistry;
  public readonly rest: RESTManager;
  
  private startedAt: Date | null = null;
  private readyAt: Date | null = null;
  private shardId?: number;
  private _shardCount?: number;

  constructor(options: ClientOptions) {
    super();
    this.token = options.token;
    
    if (Array.isArray(options.intents)) {
      this.intents = calculateIntents(options.intents as unknown as IntentBit[]);
    } else {
      this.intents = options.intents;
    }
    
    if (options.shardId !== undefined) {
      this.shardId = options.shardId;
    }
    if (options.shardCount !== undefined) {
      this._shardCount = options.shardCount;
    }
    
    this.cache = new CacheManager();
    this.scheduler = new Scheduler();
    this.metrics = globalMetrics;
    this.rest = new RESTManager(this as any);
  }

  /**
   * Login to Discord
   */
  async login(): Promise<void> {
    this.startedAt = new Date();
    console.log(`[Client] Logging in...`);
    // Gateway and REST initialization would go here
  }

  /**
   * Destroy the client
   */
  async destroy(): Promise<void> {
    this.scheduler.stopAll();
    this.cache.invalidateAll();
    this.removeAllListeners();
    console.log(`[Client] Destroyed`);
  }

  /**
   * Check if client is ready
   */
  get isReady(): boolean {
    return this.readyAt !== null;
  }

  /**
   * Get uptime
   */
  get uptime(): number | null {
    if (!this.startedAt) return null;
    return Date.now() - this.startedAt.getTime();
  }

  /**
   * Get shard ID
   */
  get shard(): number | undefined {
    return this.shardId;
  }

  /**
   * Emit ready event
   */
  private _setReady(): void {
    this.readyAt = new Date();
    this.emit('ready', this);
  }
}
