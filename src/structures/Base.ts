import type { Client } from '../core/Client.js';

export abstract class BaseStructure {
  constructor(public readonly client: Client) {}

  abstract patch(data: unknown): void;

  clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
