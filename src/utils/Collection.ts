/**
 * A Map with additional utility methods, similar to discord.js's Collection.
 */
export class Collection<K, V> extends Map<K, V> {
  /**
   * Find the first element that satisfies the predicate.
   */
  find(predicate: (value: V, key: K) => boolean): V | undefined {
    for (const [key, value] of this) {
      if (predicate(value, key)) return value;
    }
    return undefined;
  }

  /**
   * Filter the collection.
   */
  filter(predicate: (value: V, key: K) => boolean): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this) {
      if (predicate(value, key)) result.set(key, value);
    }
    return result;
  }

  /**
   * Map the collection to an array.
   */
  map<T>(fn: (value: V, key: K) => T): T[] {
    const result: T[] = [];
    for (const [key, value] of this) {
      result.push(fn(value, key));
    }
    return result;
  }

  /**
   * Check if any element satisfies the predicate.
   */
  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this) {
      if (predicate(value, key)) return true;
    }
    return false;
  }

  /**
   * Check if all elements satisfy the predicate.
   */
  every(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this) {
      if (!predicate(value, key)) return false;
    }
    return true;
  }

  /**
   * Get a random element.
   */
  random(): V | undefined {
    const array = Array.from(this.values());
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * First element.
   */
  first(): V | undefined {
    return this.values().next().value;
  }
}
