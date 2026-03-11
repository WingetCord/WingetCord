/**
 * LFU Cache - Least Frequently Used eviction
 */
export class LFUCache<K, V> {
  private cache = new Map<K, V>();
  private freqMap = new Map<K, number>();
  private readonly maxSize: number;

  constructor(options: { maxSize: number }) {
    this.maxSize = options.maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;
    
    // Increment frequency
    const freq = this.freqMap.get(key) ?? 0;
    this.freqMap.set(key, freq + 1);
    
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.set(key, value);
      const freq = this.freqMap.get(key) ?? 0;
      this.freqMap.set(key, freq + 1);
      return;
    }

    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLFU();
    }

    this.cache.set(key, value);
    this.freqMap.set(key, 1);
  }

  private evictLFU(): void {
    let minFreq = Infinity;
    let lfuKey: K | undefined;

    for (const [key, freq] of this.freqMap) {
      if (freq < minFreq) {
        minFreq = freq;
        lfuKey = key;
      }
    }

    if (lfuKey !== undefined) {
      this.cache.delete(lfuKey);
      this.freqMap.delete(lfuKey);
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    this.freqMap.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.freqMap.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
