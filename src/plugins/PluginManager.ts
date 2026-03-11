import { Collection } from '../utils/Collection.js';
import type { Plugin } from './Plugin.js';

export class PluginManager {
  private plugins = new Collection<string, Plugin>();

  async load(name: string, plugin: Plugin): Promise<void> {
    await plugin.load();
    this.plugins.set(name, plugin);
  }

  async unload(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      await plugin.unload();
      this.plugins.delete(name);
    }
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
}
