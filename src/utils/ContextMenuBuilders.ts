import { ApplicationCommandType, ApplicationCommandOptionType } from './Enums.js';

/**
 * ContextMenuCommandBuilder: WingetCord's unique approach to context menu commands.
 * Provides a fluent API for creating user and message context menus.
 */
export class ContextMenuCommandBuilder {
  private data: {
    name: string;
    type: ApplicationCommandType;
    name_localizations?: Record<string, string>;
    description?: string;
    default_member_permissions?: string;
    dm_permission?: boolean;
  } = {
    name: '',
    type: ApplicationCommandType.ChatInput,
  };

  /**
   * Set the command name (required).
   */
  setName(name: string): this {
    if (name.length > 32) {
      throw new Error('Context menu command name must be 32 characters or less');
    }
    this.data.name = name;
    return this;
  }

  /**
   * Set localized names for the command.
   */
  setNameLocalizations(localizations: Record<string, string>): this {
    this.data.name_localizations = localizations;
    return this;
  }

  /**
   * Set the command type (User or Message).
   */
  setType(type: 'user' | 'message'): this {
    this.data.type = type === 'user' ? ApplicationCommandType.User : ApplicationCommandType.Message;
    return this;
  }

  /**
   * Set default member permissions.
   */
  setDefaultMemberPermissions(permissions: bigint | string | number): this {
    this.data.default_member_permissions = permissions.toString();
    return this;
  }

  /**
   * Allow command in DMs.
   */
  setDMEnabled(enabled: boolean): this {
    this.data.dm_permission = enabled;
    return this;
  }

  /**
   * Convert to JSON for API submission.
   */
  toJSON(): Record<string, unknown> {
    if (!this.data.name) {
      throw new Error('Context menu command name is required');
    }
    return { ...this.data };
  }
}

/**
 * SlashCommandOptionBuilder: Fluent API for slash command options.
 */
export class SlashCommandOptionBuilder {
  private options: {
    type: ApplicationCommandOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: { name: string; value: string | number }[];
    options?: unknown[];
    channel_types?: number[];
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
  }[] = [];

  /**
   * Add a string option.
   */
  addStringOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.String,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add an integer option.
   */
  addIntegerOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.Integer,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add a boolean option.
   */
  addBooleanOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.Boolean,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add a user option.
   */
  addUserOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.User,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add a channel option.
   */
  addChannelOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.Channel,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add a role option.
   */
  addRoleOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.Role,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add a mentionable option.
   */
  addMentionableOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.Mentionable,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add a number option.
   */
  addNumberOption(name: string, description: string, required = false): this {
    this.options.push({
      type: ApplicationCommandOptionType.Number,
      name,
      description,
      required,
    });
    return this;
  }

  /**
   * Add choices to the last option.
   */
  addChoices(choices: { name: string; value: string | number }[]): this {
    const lastOption = this.options[this.options.length - 1];
    if (lastOption) {
      lastOption.choices = choices;
    }
    return this;
  }

  /**
   * Enable autocomplete for the last option.
   */
  setAutocomplete(enabled = true): this {
    const lastOption = this.options[this.options.length - 1];
    if (lastOption) {
      lastOption.autocomplete = enabled;
    }
    return this;
  }

  /**
   * Add a subcommand group.
   */
  addSubcommandGroup(name: string, description: string): this {
    this.options.push({
      type: ApplicationCommandOptionType.SubCommandGroup,
      name,
      description,
      options: [],
    });
    return this;
  }

  /**
   * Add a subcommand.
   */
  addSubcommand(name: string, description: string): this {
    this.options.push({
      type: ApplicationCommandOptionType.SubCommand,
      name,
      description,
      options: [],
    });
    return this;
  }

  /**
   * Get all options.
   */
  getOptions() {
    return this.options;
  }
}

/**
 * SlashCommandBuilder: Fluent API for building slash commands.
 */
export class SlashCommandBuilder {
  private data: {
    name: string;
    description: string;
    options?: unknown[];
    name_localizations?: Record<string, string>;
    description_localizations?: Record<string, string>;
    default_member_permissions?: string;
    dm_permission?: boolean;
    nsfw?: boolean;
  } = {
    name: '',
    description: '',
  };

  /**
   * Set command name.
   */
  setName(name: string): this {
    if (name.length > 32) {
      throw new Error('Command name must be 32 characters or less');
    }
    if (!/^[\w-]+$/.test(name)) {
      throw new Error('Command name must match ^[\w-]+$');
    }
    this.data.name = name;
    return this;
  }

  /**
   * Set command description.
   */
  setDescription(description: string): this {
    if (description.length > 100) {
      throw new Error('Command description must be 100 characters or less');
    }
    this.data.description = description;
    return this;
  }

  /**
   * Add localized names.
   */
  setNameLocalizations(localizations: Record<string, string>): this {
    this.data.name_localizations = localizations;
    return this;
  }

  /**
   * Add localized descriptions.
   */
  setDescriptionLocalizations(localizations: Record<string, string>): this {
    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Set default permissions.
   */
  setDefaultMemberPermissions(permissions: bigint | string | number): this {
    this.data.default_member_permissions = permissions.toString();
    return this;
  }

  /**
   * Enable DM usage.
   */
  setDMEnabled(enabled: boolean): this {
    this.data.dm_permission = enabled;
    return this;
  }

  /**
   * Mark as NSFW.
   */
  setNSFW(nsfw = true): this {
    this.data.nsfw = nsfw;
    return this;
  }

  /**
   * Add options to the command.
   */
  addOptions(options: SlashCommandOptionBuilder | SlashCommandOptionBuilder[]): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    if (options instanceof SlashCommandOptionBuilder) {
      this.data.options.push(...options.getOptions());
    } else {
      for (const opt of options) {
        this.data.options.push(...opt.getOptions());
      }
    }
    return this;
  }

  /**
   * Convert to JSON.
   */
  toJSON(): Record<string, unknown> {
    if (!this.data.name) {
      throw new Error('Command name is required');
    }
    if (!this.data.description) {
      throw new Error('Command description is required');
    }
    return { ...this.data };
  }
}
