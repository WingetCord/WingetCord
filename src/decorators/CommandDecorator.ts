/**
 * Command Decorators
 * TypeScript decorators for slash commands
 */

/**
 * Command metadata storage
 */
const commandMetadataStore = new Map<
  Function,
  {
    name: string;
    description?: string;
    options?: CommandOption[];
    cooldown?: number;
    permissions?: string[];
  }
>();

export interface CommandOption {
  name: string;
  description: string;
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' | 'number';
  required?: boolean;
  choices?: { name: string; value: string }[];
  autocomplete?: boolean;
}

/**
 * Command decorator - Register a slash command
 */
export function Command(options: { name: string; description?: string }) {
  return function (target: Function) {
    commandMetadataStore.set(target, {
      name: options.name,
      description: options.description ?? '',
    });
  };
}

/**
 * Option decorator - Add an option to a command
 */
export function Option(options: CommandOption) {
  return function (_target: Function, _propertyKey: string, _descriptor: PropertyDescriptor) {
    const metadata = commandMetadataStore.get(_target);
    if (metadata) {
      metadata.options = metadata.options || [];
      metadata.options.push(options);
    }
  };
}

/**
 * Cooldown decorator - Set command cooldown (in seconds)
 */
export function Cooldown(seconds: number) {
  return function (target: Function) {
    const metadata = commandMetadataStore.get(target);
    if (metadata) {
      metadata.cooldown = seconds;
    }
  };
}

/**
 * Permissions decorator - Required permissions to use command
 */
export function Permissions(...permissions: string[]) {
  return function (target: Function) {
    const metadata = commandMetadataStore.get(target);
    if (metadata) {
      metadata.permissions = permissions;
    }
  };
}

/**
 * Get command metadata
 */
export function getCommandMetadata(target: Function) {
  return commandMetadataStore.get(target);
}
