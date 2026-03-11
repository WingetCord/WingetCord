/**
 * Smart Cache Policies
 * LRU, LFU, and TTL eviction policies
 */

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
  accessCount?: number;
  lastAccessed?: number;
}

/**
 * Base cache interface
 */
export interface ICache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V, ttl?: number): this;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  size: number;
}

/**
 * LRU (Least Recently Used) Cache
 */
export class LRUCache<K, V> implements ICache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 3600000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Update access time and move to end (most recently used)
    entry.lastAccessed = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  set(key: K, value: V, ttl = this.defaultTTL): this {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ...(ttl > 0 ? { expiresAt: Date.now() + ttl } : {}),
      accessCount: 0,
      lastAccessed: Date.now(),
    });
    
    return this;
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need tracking
    };
  }
}

/**
 * LFU (Least Frequently Used) Cache
 */
export class LFUCache<K, V> implements ICache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private accessCounts = new Map<K, number>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 3600000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessCounts.delete(key);
      return undefined;
    }
    
    // Increment access count
    const count = (this.accessCounts.get(key) || 0) + 1;
    this.accessCounts.set(key, count);
    entry.accessCount = count;
    
    return entry.value;
  }

  set(key: K, value: V, ttl = this.defaultTTL): this {
    // Evict least frequently used if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLFU();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ...(ttl > 0 ? { expiresAt: Date.now() + ttl } : {}),
      accessCount: 1,
    });
    this.accessCounts.set(key, 1);
    
    return this;
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessCounts.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: K): boolean {
    this.accessCounts.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessCounts.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  /**
   * Evict least frequently used item
   */
  private evictLFU(): void {
    let minCount = Infinity;
    let minKey: K | undefined;

    for (const [key, count] of this.accessCounts) {
      if (count < minCount) {
        minCount = count;
        minKey = key;
      }
    }

    if (minKey !== undefined) {
      this.cache.delete(minKey);
      this.accessCounts.delete(minKey);
    }
  }
}

/**
 * TTL (Time To Live) Cache with sliding expiration
 */
export class TTLCache<K, V> implements ICache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private maxSize: number;
  private defaultTTL: number;
  private sweepInterval?: NodeJS.Timeout;

  constructor(maxSize = 1000, defaultTTL = 3600000, autoSweep = true) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    if (autoSweep) {
      this.startSweep();
    }
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  set(key: K, value: V, ttl = this.defaultTTL): this {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ...(ttl > 0 ? { expiresAt: Date.now() + ttl } : {}),
    });
    
    return this;
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  /**
   * Extend TTL on access (sliding expiration)
   */
  touch(key: K, ttl = this.defaultTTL): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    entry.expiresAt = Date.now() + ttl;
    return true;
  }

  /**
   * Start automatic sweep to remove expired entries
   */
  private startSweep(): void {
    this.sweepInterval = setInterval(() => {
      this.sweep();
    }, 60000); // Sweep every minute
  }

  /**
   * Remove all expired entries
   */
  sweep(): number {
    let removed = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: K | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
    }
  }
}

/**
 * Composite cache with multiple policies
 */
export class CompositeCache<K, V> implements ICache<K, V> {
  private caches: ICache<K, V>[] = [];

  constructor(policies: Array<{ new(...args: unknown[]): ICache<K, V> }>) {
    this.caches = policies.map(Policy => new Policy());
  }

  get(key: K): V | undefined {
    for (const cache of this.caches) {
      const value = cache.get(key);
      if (value !== undefined) {
        // Propagate to faster caches
        for (const c of this.caches) {
          if (c !== cache) {
            c.set(key, value);
          }
        }
        return value;
      }
    }
    return undefined;
  }

  set(key: K, value: V, ttl?: number): this {
    for (const cache of this.caches) {
      cache.set(key, value, ttl);
    }
    return this;
  }

  has(key: K): boolean {
    return this.caches.some(cache => cache.has(key));
  }

  delete(key: K): boolean {
    let deleted = false;
    for (const cache of this.caches) {
      if (cache.delete(key)) deleted = true;
    }
    return deleted;
  }

  clear(): void {
    for (const cache of this.caches) {
      cache.clear();
    }
  }

  get size(): number {
    return this.caches[0]?.size || 0;
  }
}
