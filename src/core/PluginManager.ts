import type { Client } from './Client.js';

export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
}

export abstract class Plugin {
  constructor(public metadata: PluginMetadata) {}

  abstract init(client: Client): Promise<void> | void;
  onStart?(client: Client): Promise<void> | void;
  onStop?(client: Client): Promise<void> | void;
}

export class PluginManager {
  public plugins: Map<string, Plugin> = new Map();

  constructor(private client: Client) {}

  async register(plugin: Plugin) {
    await plugin.init(this.client);
    this.plugins.set(plugin.metadata.name, plugin);
    if (plugin.onStart) await plugin.onStart(this.client);
  }

  async stopAll() {
    for (const plugin of this.plugins.values()) {
      if (plugin.onStop) await plugin.onStop(this.client);
    }
  }
}
