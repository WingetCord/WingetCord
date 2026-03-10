import { EventEmitter } from 'events';

export interface CollectorOptions<T> {
  filter: (item: T) => boolean;
  max?: number;
  time?: number;
  dispose?: boolean;
}

/**
 * Generic Collector system for events like Messages or Interactions.
 * Highly modular and reusable.
 */
export class Collector<T> extends EventEmitter {
  public collected: Map<string, T> = new Map();
  private timeout?: NodeJS.Timeout;

  constructor(private options: CollectorOptions<T>) {
    super();
    if (options.time) {
      this.timeout = setTimeout(() => this.stop('time'), options.time);
    }
  }

  handle(item: T, id: string) {
    if (this.options.filter(item)) {
      this.collected.set(id, item);
      this.emit('collect', item);

      if (this.options.max && this.collected.size >= this.options.max) {
        this.stop('limit');
      }
      return true;
    }
    return false;
  }

  stop(reason: string = 'user') {
    if (this.timeout) clearTimeout(this.timeout);
    this.emit('end', this.collected, reason);
    this.removeAllListeners();
  }
}
