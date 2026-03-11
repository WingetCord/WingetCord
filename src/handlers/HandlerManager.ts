/**
 * Handler Manager
 */
import { Collection } from '../utils/Collection.js';

export class HandlerManager {
  private handlers = new Collection<string, unknown>();

  register(name: string, handler: unknown): void {
    this.handlers.set(name, handler);
  }

  get(name: string): unknown {
    return this.handlers.get(name);
  }
}
