/**
 * Snowflake: WingetCord's unique snowflake ID utilities.
 * Provides utilities for working with Discord's snowflake IDs.
 */
export class Snowflake {
  /**
   * Extract timestamp from a snowflake ID.
   */
  static timestamp(id: string | bigint | number): Date {
    const snowflake = typeof id === 'string' ? BigInt(id) : BigInt(id);
    const timestamp = (snowflake >> 22n) + 1420070400000n;
    return new Date(Number(timestamp));
  }

  /**
   * Extract worker ID from a snowflake.
   */
  static workerId(id: string | bigint | number): number {
    const snowflake = typeof id === 'string' ? BigInt(id) : BigInt(id);
    return Number((snowflake >> 17n) & 0x1fn);
  }

  /**
   * Extract process ID from a snowflake.
   */
  static processId(id: string | bigint | number): number {
    const snowflake = typeof id === 'string' ? BigInt(id) : BigInt(id);
    return Number((snowflake >> 12n) & 0x1fn);
  }

  /**
   * Extract increment from a snowflake.
   */
  static increment(id: string | bigint | number): number {
    const snowflake = typeof id === 'string' ? BigInt(id) : BigInt(id);
    return Number(snowflake & 0xfffn);
  }

  /**
   * Generate a snowflake ID (for testing purposes).
   */
  static generate(timestamp?: Date): string {
    const time = timestamp ? timestamp.getTime() - 1420070400000 : Date.now() - 1420070400000;
    const timeBits = BigInt(time) << 22n;
    const workerBits = 1n << 17n; // Worker ID 1
    const processBits = 1n << 12n; // Process ID 1
    const incrementBits = 1n; // Start at 1
    return (timeBits | workerBits | processBits | incrementBits).toString();
  }

  /**
   * Check if a string is a valid snowflake format.
   */
  static isValid(id: string): boolean {
    if (!/^\d{17,19}$/.test(id)) return false;
    const num = BigInt(id);
    // Discord epoch is 1420070400000
    const timestamp = (num >> 22n) + 1420070400000n;
    return timestamp > 0n && timestamp <= BigInt(Date.now() + 86400000);
  }
}

/**
 * Timestamp: WingetCord's timestamp formatting utilities.
 */
export class Timestamp {
  /**
   * Create a timestamp string from a Date or timestamp.
   */
  static format(date: Date | number | string, style?: string): string {
    const d =
      typeof date === 'string' ? new Date(date) : typeof date === 'number' ? new Date(date) : date;
    const ts = Math.floor(d.getTime() / 1000);
    return `<t:${ts}${style ? `:${style}` : ''}>`;
  }

  /**
   * Short time format: t
   */
  static shortTime(date: Date | number | string): string {
    return this.format(date, 't');
  }

  /**
   * Long time format: T
   */
  static longTime(date: Date | number | string): string {
    return this.format(date, 'T');
  }

  /**
   * Short date format: d
   */
  static shortDate(date: Date | number | string): string {
    return this.format(date, 'd');
  }

  /**
   * Long date format: D
   */
  static longDate(date: Date | number | string): string {
    return this.format(date, 'D');
  }

  /**
   * Short date/time format: f
   */
  static dateTime(date: Date | number | string): string {
    return this.format(date, 'f');
  }

  /**
   * Long date/time format: F
   */
  static longDateTime(date: Date | number | string): string {
    return this.format(date, 'F');
  }

  /**
   * Relative time format: R
   */
  static relative(date: Date | number | string): string {
    return this.format(date, 'R');
  }
}

/**
 * RateLimiter: Simple in-memory rate limiter.
 */
export class RateLimiter {
  private buckets = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if action is allowed.
   */
  tryAcquire(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetTime < now) {
      this.buckets.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (bucket.count >= limit) {
      return false;
    }

    bucket.count++;
    return true;
  }

  /**
   * Get remaining uses for a key.
   */
  remaining(key: string, limit: number): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return limit;
    if (bucket.resetTime < Date.now()) return limit;
    return Math.max(0, limit - bucket.count);
  }

  /**
   * Get reset time for a key.
   */
  resetTime(key: string): number | null {
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetTime < Date.now()) return null;
    return bucket.resetTime;
  }

  /**
   * Clear a bucket.
   */
  clear(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Clear all buckets.
   */
  clearAll(): void {
    this.buckets.clear();
  }
}

/**
 * Resolver: Utility for resolving Discord entities.
 */
export class Resolver {
  /**
   * Resolve a user mention to ID.
   */
  static userId(input: string): string | null {
    const match = input.match(/^<@!?(\d+)>$/);
    return match?.[1] ?? null;
  }

  /**
   * Resolve a channel mention to ID.
   */
  static channelId(input: string): string | null {
    const match = input.match(/^<#(\d+)>$/);
    return match?.[1] ?? null;
  }

  /**
   * Resolve a role mention to ID.
   */
  static roleId(input: string): string | null {
    const match = input.match(/^<@&(\d+)>$/);
    return match?.[1] ?? null;
  }

  /**
   * Resolve an emoji to ID and name.
   */
  static emoji(input: string): { id: string | null; name: string; animated: boolean } | null {
    const match = input.match(/^<(a)?:(\w+):(\d+)>$/);
    if (match) {
      return {
        id: match[3] ?? null,
        name: match[2] ?? '',
        animated: !!match[1],
      };
    }
    // Plain emoji
    return {
      id: null,
      name: input,
      animated: false,
    };
  }

  /**
   * Resolve a color hex to number.
   */
  static color(input: string): number {
    if (/^#[\da-f]{6}$/i.test(input)) {
      return parseInt(input.slice(1), 16);
    }
    if (/^[\da-f]{6}$/i.test(input)) {
      return parseInt(input, 16);
    }
    return 0;
  }

  /**
   * Resolve a duration string to milliseconds.
   */
  static duration(input: string): number | null {
    const match = input.match(/^(\d+)(s|m|h|d|w)$/);
    if (!match) return null;

    const value = parseInt(match[1] ?? '0');
    const unit = match[2] ?? 's';

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
      w: 604800000,
    };

    return value * (multipliers[unit] ?? 1);
  }
}
