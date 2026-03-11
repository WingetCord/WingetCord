/**
 * Plugin System
 * Base plugin interface and utilities
 */

export enum PluginState {
  LOADED = 'loaded',
  ACTIVE = 'active',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
}

export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  optionalDependencies?: string[];
}

/**
 * Base Plugin class
 */
export abstract class Plugin {
  abstract metadata: PluginMetadata;
  state: PluginState = PluginState.LOADED;
  dependencies = new Map<string, Plugin>();
  config?: Record<string, unknown>;

  _setDependency(name: string, plugin: Plugin): void {
    this.dependencies.set(name, plugin);
  }

  _setState(state: PluginState): void {
    this.state = state;
  }

  async init(_client: unknown): Promise<void> {
    // Override in subclass
  }

  onStart?: (_client: unknown) => Promise<void>;
  onStop?: (_client: unknown) => Promise<void>;
  reload?: (_client: unknown) => Promise<void>;

  load(): Promise<void> | void {
    // Override in subclass
  }

  unload(): Promise<void> | void {
    // Override in subclass
  }
}
