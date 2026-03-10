import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import type { Client } from './Client.js';
import { Logger } from './Logger.js';

export interface CommandContext {
  client: Client;
  message: any;
  args: string[];
}

export interface CommandOptions {
  name: string;
  description: string;
  aliases?: string[];
  cooldown?: number; // In milliseconds
  permissions?: string[];
}

export abstract class Command {
  constructor(public options: CommandOptions) {}
  abstract execute(ctx: CommandContext): Promise<void> | void;
}

export class CommandManager {
  public commands: Map<string, Command> = new Map();
  public aliases: Map<string, string> = new Map();
  private cooldowns: Map<string, Map<string, number>> = new Map(); // cmdName -> userId -> timestamp

  constructor(private client: Client) {
    this.client.on('MESSAGE_CREATE', (message) => this.handleMessage(message));
  }

  register(command: Command) {
    this.commands.set(command.options.name, command);
    if (command.options.aliases) {
      for (const alias of command.options.aliases) {
        this.aliases.set(alias, command.options.name);
      }
    }
  }

  /**
   * Automatically diff localized commands with Discord and sync if needed.
   * @param force If true, skips diffing and forces a bulk overwrite.
   */
  async syncSlashCommands(force = false) {
    Logger.info(force ? 'Force syncing slash commands...' : 'Analyzing slash commands for auto-sync...');
    try {
      const app = await this.client.rest.users.getMe();
      
      const localCommandsData = Array.from(this.commands.values()).map(cmd => ({
        name: cmd.options.name,
        description: cmd.options.description,
        options: (cmd as any).slashOptions || []
      }));

      if (!force) {
        const remoteCommands = await this.client.rest.request('GET', `/applications/${app.id}/commands`);
        
        // Basic diffing (name and description)
        const needsSync = localCommandsData.length !== remoteCommands.length || 
          localCommandsData.some(local => {
            const remote = remoteCommands.find((r: any) => r.name === local.name);
            return !remote || remote.description !== local.description;
          });

        if (!needsSync) {
          Logger.info('Slash commands are already up to date.');
          return;
        }
        Logger.info('Changes detected. Syncing slash commands...');
      }

      await this.client.rest.commands.bulkOverwriteGlobalCommands(app.id, localCommandsData);
      Logger.info('Slash commands synced successfully.');
    } catch (err) {
      Logger.error('Failed to sync slash commands:', err);
    }
  }

  async load(directory: string) {
    const files = readdirSync(directory, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        await this.load(join(directory, file.name));
        continue;
      }
      if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
        const filePath = join(directory, file.name);
        if (filePath.includes('CommandManager')) continue;

        const commandModule = await import(pathToFileURL(filePath).href);
        const CommandClass = commandModule.default || Object.values(commandModule)[0];
        if (typeof CommandClass === 'function') {
          try {
            const cmd = new CommandClass();
            if (cmd instanceof Command) {
              this.register(cmd);
            }
          } catch (e) {
            // Ignore classes that aren't commands
          }
        }
      }
    }
  }

  private async handleMessage(message: any) {
    if (message.author?.bot) return;
    
    // Simplistic handling
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName) || '');
    if (!command) return;

    // Cooldown Check
    if (command.options.cooldown) {
      if (!this.cooldowns.has(command.options.name)) {
        this.cooldowns.set(command.options.name, new Map());
      }
      const timestamps = this.cooldowns.get(command.options.name)!;
      const now = Date.now();
      const expirationTime = (timestamps.get(message.author.id) || 0) + command.options.cooldown;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        Logger.warn(`User ${message.author.id} is on cooldown for ${command.options.name}. ${timeLeft.toFixed(1)}s left.`);
        return;
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), command.options.cooldown);
    }

    // Permission Check (Simplistic for Phase 2)
    // In a real framework, we'd fetch member permissions
    if (command.options.permissions) {
      // Stub: Assume member object exists and has permissions
      // if (!message.member?.permissions.has(command.options.permissions)) return;
    }

    try {
      await command.execute({ client: this.client, message, args });
    } catch (error) {
      Logger.error(`Error executing command ${commandName}:`, error);
    }
  }
}
