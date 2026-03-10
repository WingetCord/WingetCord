/**
 * Plugin Loader
 * Dynamic plugin loading from files with dependency resolution
 */

import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { pathToFileURL } from 'url';
import type { Client } from '../core/Client.js';
import { Logger } from '../core/Logger.js';
import { Plugin, type PluginMetadata, PluginState } from './Plugin.js';

/**
 * Plugin load options
 */
export interface LoadOptions {
  /** Directory to load plugins from */
  directory: string;
  /** File patterns to match (default: .js, .ts, .mjs) */
  patterns?: string[];
  /** Whether to load recursively */
  recursive?: boolean;
  /** Plugin configuration */
  config?: Record<string, Record<string, unknown>>;
}

/**
 * Plugin load result
 */
export interface LoadResult {
  success: boolean;
  loaded: string[];
  failed: Array<{ name: string; error: Error }>;
  skipped: string[];
}

/**
 * Plugin loader with dependency resolution
 */
export class PluginLoader {
  private loadedPlugins = new Map<string, Plugin>();

  constructor(private client: Client) {}

  /**
   * Load plugins from a directory
   */
  async loadFromDirectory(options: LoadOptions): Promise<LoadResult> {
    const { directory, patterns = ['.js', '.ts', '.mjs'], recursive = true } = options;
    
    const result: LoadResult = {
      success: true,
      loaded: [],
      failed: [],
      skipped: [],
    };

    try {
      const files = this.scanDirectory(directory, recursive, patterns);
      
      for (const file of files) {
        try {
          const plugin = await this.loadPlugin(file, options.config?.[this.getPluginName(file)]);
          if (plugin) {
            result.loaded.push(plugin.metadata.name);
          }
        } catch (error) {
          result.failed.push({
            name: this.getPluginName(file),
            error: error as Error,
          });
        }
      }

      // Resolve dependencies
      await this.resolveDependencies();

      // Initialize and start plugins in order
      for (const plugin of this.loadedPlugins.values()) {
        try {
          await this.initializePlugin(plugin);
        } catch (error) {
          Logger.error(`[PluginLoader] Failed to initialize ${plugin.metadata.name}:`, error);
          result.failed.push({
            name: plugin.metadata.name,
            error: error as Error,
          });
        }
      }

      result.success = result.failed.length === 0;
    } catch (error) {
      Logger.error('[PluginLoader] Failed to load plugins:', error);
      result.success = false;
    }

    return result;
  }

  /**
   * Load a single plugin from file
   */
  async loadPlugin(filePath: string, config?: Record<string, unknown>): Promise<Plugin | null> {
    const url = pathToFileURL(filePath).href;
    const module = await import(url);
    
    // Find the plugin class in the module
    const PluginClass = module.default || module.Plugin || Object.values(module).find(
      (v) => v && typeof v === 'function' && v.prototype instanceof Plugin
    );

    if (!PluginClass) {
      throw new Error(`No Plugin class found in ${filePath}`);
    }

    const plugin = new PluginClass(config) as Plugin;
    this.loadedPlugins.set(plugin.metadata.name, plugin);
    
    Logger.info(`[PluginLoader] Loaded plugin: ${plugin.metadata.name} v${plugin.metadata.version}`);
    
    return plugin;
  }

  /**
   * Resolve plugin dependencies
   */
  async resolveDependencies(): Promise<void> {
    for (const [name, plugin] of this.loadedPlugins) {
      const deps = plugin.metadata.dependencies || [];
      
      for (const depName of deps) {
        const depPlugin = this.loadedPlugins.get(depName);
        
        if (!depPlugin) {
          throw new Error(`Plugin ${name} requires ${depName} but it's not loaded`);
        }
        
        plugin._setDependency(depName, depPlugin);
      }

      // Optional dependencies (don't throw if missing)
      const optionalDeps = plugin.metadata.optionalDependencies || [];
      for (const depName of optionalDeps) {
        const depPlugin = this.loadedPlugins.get(depName);
        if (depPlugin) {
          plugin._setDependency(depName, depPlugin);
        }
      }
    }
  }

  /**
   * Initialize a plugin
   */
  async initializePlugin(plugin: Plugin): Promise<void> {
    if (plugin.state !== PluginState.LOADED) {
      Logger.warn(`[PluginLoader] Plugin ${plugin.metadata.name} is not in LOADED state`);
      return;
    }

    await plugin.init(this.client);
    plugin._setState(PluginState.ACTIVE);

    if (plugin.onStart) {
      await plugin.onStart(this.client);
    }

    Logger.info(`[PluginLoader] Started plugin: ${plugin.metadata.name}`);
  }

  /**
   * Stop and unload a plugin
   */
  async unloadPlugin(name: string): Promise<boolean> {
    const plugin = this.loadedPlugins.get(name);
    
    if (!plugin) {
      Logger.warn(`[PluginLoader] Plugin ${name} not found`);
      return false;
    }

    // Check if other plugins depend on this
    for (const [, p] of this.loadedPlugins) {
      if (p.dependencies.has(name)) {
        Logger.error(`[PluginLoader] Cannot unload ${name}: other plugins depend on it`);
        return false;
      }
    }

    plugin._setState(PluginState.STOPPING);
    
    if (plugin.onStop) {
      await plugin.onStop(this.client);
    }

    plugin._setState(PluginState.STOPPED);
    this.loadedPlugins.delete(name);
    
    Logger.info(`[PluginLoader] Unloaded plugin: ${name}`);
    return true;
  }

  /**
   * Hot reload a plugin
   */
  async reloadPlugin(name: string): Promise<boolean> {
    const plugin = this.loadedPlugins.get(name);
    
    if (!plugin) {
      Logger.warn(`[PluginLoader] Plugin ${name} not found for reload`);
      return false;
    }

    // Call reload if available
    if (plugin.reload) {
      await plugin.reload(this.client);
      return true;
    }

    // Otherwise, do full reload
    const config = plugin.config;
    const filePath = this.getPluginFilePath(name);
    
    if (!filePath) {
      Logger.error(`[PluginLoader] Cannot find file for plugin ${name}`);
      return false;
    }

    // Unload first
    await this.unloadPlugin(name);
    
    // Reload
    try {
      await this.loadPlugin(filePath, config);
      await this.resolveDependencies();
      const newPlugin = this.loadedPlugins.get(name);
      if (newPlugin) {
        await this.initializePlugin(newPlugin);
      }
      return true;
    } catch (error) {
      Logger.error(`[PluginLoader] Failed to reload plugin ${name}:`, error);
      return false;
    }
  }

  /**
   * Get all loaded plugins
   */
  getPlugins(): Map<string, Plugin> {
    return new Map(this.loadedPlugins);
  }

  /**
   * Get a plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.loadedPlugins.get(name);
  }

  /**
   * Scan directory for plugin files
   */
  private scanDirectory(dir: string, recursive: boolean, patterns: string[]): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory() && recursive) {
          files.push(...this.scanDirectory(fullPath, recursive, patterns));
        } else if (stat.isFile()) {
          const ext = extname(fullPath);
          if (patterns.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      Logger.error(`[PluginLoader] Error scanning directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Get plugin name from file path
   */
  private getPluginName(filePath: string): string {
    const baseName = filePath.split(/[/\\]/).pop() || '';
    return baseName.replace(/\.(js|ts|mjs)$/, '');
  }

  /**
   * Get plugin file path (placeholder - would need to track loaded paths)
   */
  private getPluginFilePath(name: string): string | null {
    // This would need to be implemented with path tracking
    return null;
  }
}
