/**
 * Enhanced Plugin System
 * Provides dynamic plugin loading, dependencies, and lifecycle management
 */

import type { Client } from '../core/Client.js';
import { Logger } from '../core/Logger.js';

/**
 * Plugin metadata interface
 */
export interface PluginMetadata {
  /** Unique plugin name */
  name: string;
  /** Plugin version (semver) */
  version: string;
  /** Plugin description */
  description?: string;
  /** Plugin author */
  author?: string;
  /** Required dependencies */
  dependencies?: string[];
  /** Optional dependencies */
  optionalDependencies?: string[];
  /** Plugin configuration schema */
  configSchema?: Record<string, ConfigField>;
  /** Events this plugin listens to */
  events?: string[];
  /** Commands provided by this plugin */
  commands?: string[];
}

/**
 * Configuration field schema
 */
export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  default?: unknown;
  description?: string;
}

/**
 * Plugin state
 */
export enum PluginState {
  /** Plugin is loaded but not initialized */
  LOADED = 'loaded',
  /** Plugin is initializing */
  INITIALIZING = 'initializing',
  /** Plugin is active */
  ACTIVE = 'active',
  /** Plugin is stopping */
  STOPPING = 'stopping',
  /** Plugin is stopped */
  STOPPED = 'stopped',
  /** Plugin has an error */
  ERROR = 'error',
}

/**
 * Base Plugin class with lifecycle hooks
 */
export abstract class Plugin {
  public state: PluginState = PluginState.LOADED;
  public config: Record<string, unknown> = {};
  public dependencies: Map<string, Plugin> = new Map();
  
  constructor(
    public metadata: PluginMetadata,
    config?: Record<string, unknown>
  ) {
    if (config) {
      this.config = { ...config };
    }
  }

  /**
   * Initialize the plugin (called when registered)
   */
  async init(client: Client): Promise<void> {
    this.state = PluginState.INITIALIZING;
    Logger.info(`[Plugin:${this.metadata.name}] Initializing...`);
  }

  /**
   * Start the plugin (called after init)
   */
  async onStart?(client: Client): Promise<void>;

  /**
   * Stop the plugin (called when unloaded)
   */
  async onStop?(client: Client): Promise<void>;

  /**
   * Reload the plugin (hot reload)
   */
  async reload?(client: Client): Promise<void>;

  /**
   * Get a dependency by name
   */
  dep<T extends Plugin = Plugin>(name: string): T | undefined {
    return this.dependencies.get(name) as T | undefined;
  }

  /**
   * Check if a dependency is available
   */
  hasDep(name: string): boolean {
    return this.dependencies.has(name);
  }

  /**
   * Internal: Set dependency
   */
  _setDependency(name: string, plugin: Plugin): void {
    this.dependencies.set(name, plugin);
  }

  /**
   * Internal: Set state
   */
  _setState(state: PluginState): void {
    this.state = state;
  }
}

/**
 * Utility function to create plugin metadata
 */
export function createPluginMetadata(
  name: string,
  version: string,
  options?: Partial<PluginMetadata>
): PluginMetadata {
  return {
    name,
    version,
    ...options,
  };
}
