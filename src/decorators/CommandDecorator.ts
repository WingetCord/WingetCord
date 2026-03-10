/**
 * Command Decorators
 * TypeScript decorators for defining Discord commands
 */

import type { ApplicationCommandOptionType } from 'discord-api-types/v10';

/**
 * Command option types mapping
 */
export const OptionType = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTACHMENT: 11,
} as const;

/**
 * Command option definition
 */
export interface CommandOption {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: Array<{ name: string; value: string | number }>;
  options?: CommandOption[];
  autocomplete?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
}

/**
 * Command metadata storage using Map
 */
const commandMetadata = new Map<object, CommandOptions>();
const commandOptions = new Map<Function, CommandOption[]>();
const cooldownMetadata = new Map<Function, number>();
const permissionsMetadata = new Map<Function, string[]>();

/**
 * Command decorator options
 */
export interface CommandOptions {
  name: string;
  description: string;
  options?: CommandOption[];
  defaultPermission?: boolean;
  dmPermission?: boolean;
}

/**
 * Command decorator
 * Usage: @Command({ name: 'ping', description: 'Pong!' })
 */
export function Command(options: CommandOptions): (target: object) => void {
  return (target: object) => {
    commandMetadata.set(target, options);
  };
}

/**
 * SubCommand decorator for methods
 */
export function SubCommand(name: string, description: string) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    const option: CommandOption = {
      name,
      description,
      type: OptionType.SUB_COMMAND,
    };
    
    const existing = commandOptions.get(method) || [];
    commandOptions.set(method, [...existing, option]);
  };
}

/**
 * Command option decorator
 */
export function Option(
  name: string,
  description: string,
  type: number,
  required = false
) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    const option: CommandOption = {
      name,
      description,
      type,
      required,
    };
    
    const existing = commandOptions.get(method) || [];
    commandOptions.set(method, [...existing, option]);
  };
}

/**
 * String option shortcut
 */
export function StringOption(name: string, description: string, required = false) {
  return Option(name, description, OptionType.STRING, required);
}

/**
 * Number option shortcut
 */
export function NumberOption(name: string, description: string, required = false) {
  return Option(name, description, OptionType.NUMBER, required);
}

/**
 * Integer option shortcut
 */
export function IntegerOption(name: string, description: string, required = false) {
  return Option(name, description, OptionType.INTEGER, required);
}

/**
 * Boolean option shortcut
 */
export function BooleanOption(name: string, description: string, required = false) {
  return Option(name, description, OptionType.BOOLEAN, required);
}

/**
 * User option shortcut
 */
export function UserOption(name: string, description: string, required = false) {
  return Option(name, description, OptionType.USER, required);
}

/**
 * Channel option shortcut
 */
export function ChannelOption(name: string, description: string, required = false) {
  return Option(name, description, OptionType.CHANNEL, required);
}

/**
 * Role option shortcut
 */
export function RoleOption(name: string, description: string, required = false) {
  return Option(name, description, OptionType.ROLE, required);
}

/**
 * Choice decorator for options
 */
export function Choices<T extends string | number>(choices: Array<{ name: string; value: T }>) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    const existing = commandOptions.get(method);
    
    if (existing) {
      const updated = existing.map((opt) => ({
        ...opt,
        choices,
      }));
      commandOptions.set(method, updated);
    }
  };
}

/**
 * Cooldown decorator
 */
export function Cooldown(seconds: number) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    cooldownMetadata.set(method, seconds);
  };
}

/**
 * Permissions decorator
 */
export function Permissions(...permissions: string[]) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    permissionsMetadata.set(method, permissions);
  };
}

/**
 * Get command metadata from a class
 */
export function getCommandMetadata(target: object): CommandOptions | undefined {
  return commandMetadata.get(target);
}

/**
 * Get command options from a method
 */
export function getCommandOptions(method: Function): CommandOption[] {
  return commandOptions.get(method) || [];
}

/**
 * Get cooldown from a method
 */
export function getCooldown(method: Function): number | undefined {
  return cooldownMetadata.get(method);
}

/**
 * Get permissions from a method
 */
export function getPermissions(method: Function): string[] | undefined {
  return permissionsMetadata.get(method);
}

/**
 * Decorator utilities - scan a class for decorated methods
 */
export interface DecoratedCommand {
  method: Function;
  options: CommandOptions;
  methodOptions: CommandOption[];
  cooldown?: number;
  permissions?: string[];
}

/**
 * Scan a class for decorated commands
 */
export function scanCommands(target: object): DecoratedCommand[] {
  const commands: DecoratedCommand[] = [];
  const metadata = commandMetadata.get(target);
  
  if (!metadata) return commands;
  
  for (const key of Object.getOwnPropertyNames(target)) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor && descriptor.value) {
      const method = descriptor.value as Function;
      const methodOptions = commandOptions.get(method) || [];
      const cooldown = cooldownMetadata.get(method);
      const permissions = permissionsMetadata.get(method);
      
      if (methodOptions.length > 0) {
        commands.push({
          method,
          options: {
            ...metadata,
            options: methodOptions,
          },
          methodOptions,
          cooldown,
          permissions,
        });
      }
    }
  }
  
  return commands;
}
