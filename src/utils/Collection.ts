/**
 * Collection - Map with additional utility methods
 */
export class Collection<K, V> extends Map<K, V> {
  constructor(entries?: readonly [K, V][] | null) {
    super(entries);
  }

  /**
   * Find a value by predicate
   */
  find(predicate: (value: V, key: K, collection: this) => boolean): V | undefined {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Filter values by predicate
   */
  filter(predicate: (value: V, key: K, collection: this) => boolean): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        result.set(key, value);
      }
    }
    return result;
  }

  /**
   * Map values to new values
   */
  map<T>(transform: (value: V, key: K, collection: this) => T): T[] {
    const result: T[] = [];
    for (const [key, value] of this) {
      result.push(transform(value, key, this));
    }
    return result;
  }

  /**
   * Check if any value matches predicate
   */
  some(predicate: (value: V, key: K, collection: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if all values match predicate
   */
  every(predicate: (value: V, key: K, collection: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (!predicate(value, key, this)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Reduce to single value
   */
  reduce<T>(
    reducer: (accumulator: T, value: V, key: K, collection: this) => T,
    initialValue: T
  ): T {
    let result = initialValue;
    for (const [key, value] of this) {
      result = reducer(result, value, key, this);
    }
    return result;
  }

  /**
   * Get first value
   */
  first(): V | undefined {
    return this.values().next().value;
  }

  /**
   * Get first N values
   */
  firstN(n: number): V[] {
    const result: V[] = [];
    let i = 0;
    for (const value of this.values()) {
      if (i >= n) break;
      result.push(value);
      i++;
    }
    return result;
  }

  /**
   * Get last value
   */
  last(): V | undefined {
    let result: V | undefined;
    for (const value of this.values()) {
      result = value;
    }
    return result;
  }

  /**
   * Get last N values
   */
  lastN(n: number): V[] {
    const values = Array.from(this.values());
    return values.slice(-n);
  }

  /**
   * Key of first matching value
   */
  keyOf(value: V): K | undefined {
    for (const [key, val] of this) {
      if (val === value) return key;
    }
    return undefined;
  }

  /**
   * Keys array
   */
  keysArray(): K[] {
    return Array.from(this.keys());
  }

  /**
   * Values array
   */
  valuesArray(): V[] {
    return Array.from(this.values());
  }

  /**
   * Entries array
   */
  entriesArray(): [K, V][] {
    return Array.from(this.entries());
  }

  /**
   * Clone the collection
   */
  clone(): Collection<K, V> {
    return new Collection(Array.from(this.entries()));
  }

  /**
   * Merge with another collection
   */
  merge(other: Collection<K, V>, conflictResolver?: (a: V, b: V, key: K) => V): Collection<K, V> {
    const result = this.clone();
    for (const [key, value] of other) {
      if (result.has(key) && conflictResolver) {
        result.set(key, conflictResolver(result.get(key)!, value, key));
      } else {
        result.set(key, value);
      }
    }
    return result;
  }

  /**
   * Sort by value
   */
  sortBy(compareFn: (a: V, b: V) => number): Collection<K, V> {
    const entries = this.entriesArray();
    entries.sort((a, b) => compareFn(a[1], b[1]));
    return new Collection(entries);
  }

  /**
   * Reverse the collection
   */
  reverse(): Collection<K, V> {
    const entries = this.entriesArray().reverse();
    return new Collection(entries);
  }

  /**
   * Random value
   */
  random(): V | undefined {
    const keys = this.keysArray();
    if (keys.length === 0) return undefined;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return randomKey !== undefined ? this.get(randomKey) : undefined;
  }

  /**
   * Random key
   */
  randomKey(): K | undefined {
    const keys = this.keysArray();
    if (keys.length === 0) return undefined;
    return keys[Math.floor(Math.random() * keys.length)];
  }

  /**
   * Check equality
   */
  equals(other: Collection<K, V>): boolean {
    if (this.size !== other.size) return false;
    for (const [key, value] of this) {
      if (other.get(key) !== value) return false;
    }
    return true;
  }
}
