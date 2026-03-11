/**
 * Cache Adapters
 * Memory and Redis (optional) cache backends
 */

import type { ICache } from './policies.js';
import { LRUCache, TTLCache } from './policies.js';

/**
 * Cache adapter interface
 */
export interface CacheAdapter<K, V> extends ICache<K, V> {
  /** Get cache stats */
  getStats?(): CacheStats;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

/**
 * Memory cache adapter (default)
 */
export class MemoryCache<K, V> implements CacheAdapter<K, V> {
  private cache: ICache<K, V>;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 1000, defaultTTL = 3600000, policy: 'LRU' | 'LFU' | 'TTL' = 'LRU') {
    switch (policy) {
      case 'LRU':
        this.cache = new LRUCache<K, V>(maxSize, defaultTTL);
        break;
      case 'TTL':
        this.cache = new TTLCache<K, V>(maxSize, defaultTTL, false);
        break;
      default:
        this.cache = new LRUCache<K, V>(maxSize, defaultTTL);
    }
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }
    return value;
  }

  set(key: K, value: V, ttl?: number): this {
    this.cache.set(key, value, ttl);
    return this;
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  get size(): number {
    return this.cache.size;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }
}

/**
 * Simple cache manager for creating typed caches
 */
export class CacheManager {
  private caches = new Map<string, CacheAdapter<unknown, unknown>>();

  /**
   * Create a typed cache
   */
  create<V>(
    name: string,
    options?: {
      maxSize?: number;
      ttl?: number;
      policy?: 'LRU' | 'LFU' | 'TTL';
    }
  ): CacheAdapter<string, V> {
    const cache = new MemoryCache<string, V>(
      options?.maxSize || 1000,
      options?.ttl || 3600000,
      options?.policy || 'LRU'
    );

    this.caches.set(name, cache as CacheAdapter<unknown, unknown>);
    return cache;
  }

  /**
   * Get a cache by name
   */
  get<V>(name: string): CacheAdapter<string, V> | undefined {
    return this.caches.get(name) as CacheAdapter<string, V> | undefined;
  }

  /**
   * Delete a cache
   */
  delete(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      return this.caches.delete(name);
    }
    return false;
  }

  /**
   * Get all cache statistics
   */
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};

    for (const [name, cache] of this.caches) {
      if (cache.getStats) {
        stats[name] = cache.getStats();
      }
    }

    return stats;
  }
}
