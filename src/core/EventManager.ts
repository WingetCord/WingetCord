export abstract class Event {
  constructor(
    public name: string,
    public once = false
  ) {}
  abstract execute(...args: unknown[]): void | Promise<void>;
}

import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import type { Client } from './Client.js';

export class EventManager {
  constructor(private client: Client) {}

  register(event: Event) {
    const handler = (...args: unknown[]) => event.execute(...args);
    if (event.once) {
      this.client.once(event.name, handler);
    } else {
      this.client.on(event.name, handler);
    }
  }

  async load(directory: string) {
    const files = readdirSync(directory, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        await this.load(join(directory, file.name));
        continue;
      }

      if (!file.name.endsWith('.ts') && !file.name.endsWith('.js')) continue;

      const filePath = join(directory, file.name);
      if (filePath.includes('EventManager')) continue;

      try {
        const eventModule = await import(pathToFileURL(filePath).href);
        const EventClass = eventModule.default || Object.values(eventModule)[0];
        if (typeof EventClass === 'function') {
          const ev = new EventClass();
          if (ev instanceof Event) {
            this.register(ev);
          }
        }
      } catch {
        // Ignore non-event classes
      }
    }
  }
}
