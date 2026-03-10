import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import type { Client } from './Client.js';
import { Logger } from './Logger.js';
import { Command } from './CommandManager.js';
import { Event } from './EventManager.js';

export interface HandlerOptions {
  commands?: string;
  events?: string;
  interactions?: string;
}

/**
 * HandlerManager: The high-level orchestrator for WingetCord.
 * Automatically discovers, validates, and registers commands, events, and interaction handlers.
 */
export class HandlerManager {
  constructor(private client: Client) {}

  /**
   * Automatically load all resources from specified directories.
   */
  async setup(options: HandlerOptions) {
    if (options.commands) {
      Logger.info(`Scanning commands in: ${options.commands}`);
      await this.loadDirectory(options.commands, 'command');
    }
    if (options.events) {
      Logger.info(`Scanning events in: ${options.events}`);
      await this.loadDirectory(options.events, 'event');
    }
  }

  private async loadDirectory(dir: string, type: 'command' | 'event') {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
         await this.loadDirectory(filePath, type);
         continue;
      }

      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      try {
        const module = await import(pathToFileURL(filePath).href);
        const Class = module.default || Object.values(module)[0];

        if (typeof Class !== 'function') continue;

        const instance = new Class();

        if (type === 'command' && instance instanceof Command) {
          this.client.commands.register(instance);
          Logger.debug(`[Handler] Registered command: ${instance.options.name}`);
        } else if (type === 'event' && instance instanceof Event) {
          this.client.events.register(instance);
          Logger.debug(`[Handler] Registered event: ${instance.name}`);
        }
      } catch (err) {
        Logger.error(`[Handler] Failed to load ${file}:`, err);
      }
    }
  }
}
