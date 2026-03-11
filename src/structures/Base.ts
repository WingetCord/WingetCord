import type { Client } from '../client/Client.js';

/**
 * Base Structure
 */
export class BaseStructure {
  constructor(public readonly client: Client) {}
}
