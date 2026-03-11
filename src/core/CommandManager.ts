import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import type { Client } from './Client.js';
import { Logger } from './Logger.js';
import { Message } from '../structures/Message.js';

export interface CommandContext {
  client: Client;
  message: Message;
  args: string[];
}

export interface CommandOptions {
  name: string;
  description: string;
  aliases?: string[];
  cooldown?: number;
  permissions?: string[];
}

export abstract class Command {
  constructor(public options: CommandOptions) {}
  abstract execute(ctx: CommandContext): unknown;
}

export class CommandManager {
  commands = new Map<string, Command>();
  aliases = new Map<string, string>();
  private cooldowns = new Map<string, Map<string, number>>();

  constructor(private client: Client) {
    this.client.on('MESSAGE_CREATE', (message: unknown) => this.handleMessage(message));
  }

  register(command: Command) {
    this.commands.set(command.options.name, command);
    if (command.options.aliases) {
      for (const alias of command.options.aliases) {
        this.aliases.set(alias, command.options.name);
      }
    }
  }

  async syncSlashCommands(force = false) {
    Logger.info(
      force ? 'Force syncing slash commands...' : 'Analyzing slash commands for auto-sync...'
    );
    try {
      const app = (await this.client.rest.users.getMe()) as { id: string };

      const localCommandsData = Array.from(this.commands.values()).map(cmd => ({
        name: cmd.options.name,
        description: cmd.options.description,
        options: (cmd as unknown as { slashOptions?: unknown[] }).slashOptions || [],
      }));

      if (!force) {
        const remoteCommands = (await this.client.rest.request(
          'GET',
          `/applications/${app.id}/commands`
        )) as Array<{ name: string; description: string }>;

        const needsSync =
          localCommandsData.length !== remoteCommands.length ||
          localCommandsData.some(local => {
            const remote = remoteCommands.find(r => r.name === local.name);
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

      if (!file.name.endsWith('.ts') && !file.name.endsWith('.js')) continue;

      const filePath = join(directory, file.name);
      if (filePath.includes('CommandManager')) continue;

      try {
        const commandModule = await import(pathToFileURL(filePath).href);
        const CommandClass = commandModule.default || Object.values(commandModule)[0];
        if (typeof CommandClass === 'function') {
          const cmd = new CommandClass();
          if (cmd instanceof Command) {
            this.register(cmd);
          }
        }
      } catch {
        // Ignore non-command classes
      }
    }
  }

  private async handleMessage(message: unknown) {
    const msg = message as { author?: { bot?: boolean; id?: string }; content?: string };
    if (msg.author?.bot) return;

    const prefix = '!';
    if (!msg.content?.startsWith(prefix)) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command =
      this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName) || '');
    if (!command) return;

    if (command.options.cooldown) {
      if (!this.cooldowns.has(command.options.name)) {
        this.cooldowns.set(command.options.name, new Map());
      }
      const timestamps = this.cooldowns.get(command.options.name)!;
      const now = Date.now();
      const expirationTime = (timestamps.get(msg.author?.id || '') || 0) + command.options.cooldown;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        Logger.warn(
          `User ${msg.author?.id} is on cooldown for ${command.options.name}. ${timeLeft.toFixed(1)}s left.`
        );
        return;
      }
      timestamps.set(msg.author?.id || '', now);
      setTimeout(() => timestamps.delete(msg.author?.id || ''), command.options.cooldown);
    }

    try {
      const msgObj = new Message(this.client, message as any);
      await command.execute({ client: this.client, message: msgObj, args });
    } catch (error) {
      Logger.error(`Error executing command ${commandName}:`, error);
    }
  }
}
