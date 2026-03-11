export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class Validator {
  /**
   * Validate a snowflake ID
   */
  static isSnowflake(value: string): boolean {
    if (typeof value !== 'string') return false;
    if (value.length < 17 || value.length > 20) return false;
    return /^\d+$/.test(value);
  }

  /**
   * Validate a channel mention
   */
  static isChannelMention(value: string): boolean {
    return /^<#\d+>$/.test(value);
  }

  /**
   * Validate a role mention
   */
  static isRoleMention(value: string): boolean {
    return /^<@&\d+>$/.test(value);
  }

  /**
   * Validate a user mention
   */
  static isUserMention(value: string): boolean {
    return /^<@!?\d+>$/.test(value);
  }

  /**
   * Validate an emoji (unicode or custom)
   */
  static isEmoji(value: string): boolean {
    // Unicode emoji
    if (/^\p{Emoji}$/u.test(value)) return true;
    // Custom emoji <:name:id>
    return /^<a?:\w+:\d+>$/.test(value);
  }

  /**
   * Validate hex color
   */
  static isHexColor(value: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
  }

  /**
   * Validate ISO8601 timestamp
   */
  static isISO8601(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * Validate URL
   */
  static isURL(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate guild name (2-100 characters)
   */
  static validateGuildName(name: string): void {
    if (typeof name !== 'string') {
      throw new ValidationError('Guild name must be a string', 'name');
    }
    if (name.length < 2 || name.length > 100) {
      throw new ValidationError('Guild name must be between 2 and 100 characters', 'name');
    }
  }

  /**
   * Validate channel name (2-100 characters)
   */
  static validateChannelName(name: string): void {
    if (typeof name !== 'string') {
      throw new ValidationError('Channel name must be a string', 'name');
    }
    if (name.length < 2 || name.length > 100) {
      throw new ValidationError('Channel name must be between 2 and 100 characters', 'name');
    }
  }

  /**
   * Validate role name (1-100 characters)
   */
  static validateRoleName(name: string): void {
    if (typeof name !== 'string') {
      throw new ValidationError('Role name must be a string', 'name');
    }
    if (name.length < 1 || name.length > 100) {
      throw new ValidationError('Role name must be between 1 and 100 characters', 'name');
    }
  }

  /**
   * Validate message content (0-2000 characters)
   */
  static validateMessageContent(content: string): void {
    if (typeof content !== 'string') {
      throw new ValidationError('Message content must be a string', 'content');
    }
    if (content.length > 2000) {
      throw new ValidationError('Message content must be 2000 characters or less', 'content');
    }
  }

  /**
   * Validate username (2-32 characters)
   */
  static validateUsername(username: string): void {
    if (typeof username !== 'string') {
      throw new ValidationError('Username must be a string', 'username');
    }
    if (username.length < 2 || username.length > 32) {
      throw new ValidationError('Username must be between 2 and 32 characters', 'username');
    }
  }

  /**
   * Validate nickname (1-32 characters or null)
   */
  static validateNickname(nickname: string | null): void {
    if (nickname === null) return;
    if (typeof nickname !== 'string') {
      throw new ValidationError('Nickname must be a string or null', 'nickname');
    }
    if (nickname.length < 1 || nickname.length > 32) {
      throw new ValidationError('Nickname must be between 1 and 32 characters', 'nickname');
    }
  }
}
