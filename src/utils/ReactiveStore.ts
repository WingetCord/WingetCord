import { EventEmitter } from 'events';
import { Logger } from '../core/Logger.js';

/**
 * ReactiveStore: A Proxy-based reactive state manager for WingetCord.
 * Supports events on change and optional persistence.
 */
export class ReactiveStore extends EventEmitter {
  private data: any;

  constructor(initialData: any = {}) {
    super();
    this.data = this.createProxy(initialData);
  }

  private createProxy(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    // Recursively proxy nested objects
    for (const key in obj) {
      obj[key] = this.createProxy(obj[key]);
    }

    return new Proxy(obj, {
      set: (target, prop, value) => {
        const oldValue = target[prop];
        target[prop] = this.createProxy(value);
        
        if (oldValue !== value) {
          this.emit('change', { property: prop, oldValue, newValue: value, state: this.data });
          this.emit(`change:${String(prop)}`, { oldValue, newValue: value });
        }
        
        return true;
      },
      deleteProperty: (target, prop) => {
        const oldValue = target[prop];
        delete target[prop];
        this.emit('change', { property: prop, oldValue, newValue: undefined, state: this.data });
        this.emit(`delete:${String(prop)}`, { oldValue });
        return true;
      }
    });
  }

  /**
   * Get the underlying data.
   */
  get state() {
    return this.data;
  }

  /**
   * Reset the store with new data.
   */
  reset(newData: any) {
    this.data = this.createProxy(newData);
    this.emit('reset', this.data);
  }
}
