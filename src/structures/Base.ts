/**
 * Base class for all Discord API structures.
 * Provides a consistent interface for wrapping raw data.
 */
import type { Client } from '../core/Client.js';

export abstract class BaseStructure {
  constructor(public readonly client: Client) {}

  /**
   * Patch the structure with new data.
   */
  abstract patch(data: any): void;

  /**
   * Clone the structure.
   */
  clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
