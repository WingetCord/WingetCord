/**
 * Command Manager
 */
import { Collection } from '../utils/Collection.js';

export class CommandManager {
  private commands = new Collection<string, Command>();

  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  getAll(): Collection<string, Command> {
    return this.commands;
  }
}

export interface Command {
  name: string;
  description?: string;
  options?: unknown[];
  execute: (ctx: CommandContext) => Promise<void>;
}

export interface CommandContext {
  interaction: unknown;
  args: Record<string, unknown>;
}
