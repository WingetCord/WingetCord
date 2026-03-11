export const PermissionFlagsBits = {
  CREATE_INSTANT_INVITE: 1n << 0n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  ADD_REACTIONS: 1n << 6n,
  VIEW_AUDIT_LOG: 1n << 7n,
  PRIORITY_SPEAKER: 1n << 8n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  SEND_TTS_MESSAGES: 1n << 12n,
  MANAGE_MESSAGES: 1n << 13n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  MUTE_MEMBERS: 1n << 22n,
  DEAFEN_MEMBERS: 1n << 23n,
  MOVE_MEMBERS: 1n << 24n,
  USE_VAD: 1n << 25n,
  CHANGE_NICKNAME: 1n << 26n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MANAGE_EMOJIS_AND_STICKERS: 1n << 30n,
  USE_APPLICATION_COMMANDS: 1n << 31n,
  REQUEST_TO_SPEAK: 1n << 32n,
  MANAGE_EVENTS: 1n << 33n,
  MANAGE_THREADS: 1n << 34n,
  USE_PUBLIC_THREADS: 1n << 35n,
  USE_PRIVATE_THREADS: 1n << 36n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
  START_EMBEDDED_ACTIVITIES: 1n << 39n,
  MODERATE_MEMBERS: 1n << 40n,
} as const;

export type PermissionFlagsBits = typeof PermissionFlagsBits;
export type Permission = keyof PermissionFlagsBits;

export class PermissionsBitField {
  private bitfield: bigint;

  constructor(permissions: bigint | Permission | Permission[] = 0n) {
    if (Array.isArray(permissions)) {
      this.bitfield = permissions.reduce((acc, p) => acc | (PermissionFlagsBits[p] ?? 0n), 0n);
    } else if (typeof permissions === 'string') {
      this.bitfield = PermissionFlagsBits[permissions] ?? 0n;
    } else {
      this.bitfield = permissions;
    }
  }

  has(permission: Permission | Permission[]): boolean {
    if (Array.isArray(permission)) {
      return permission.every(p => this.has(p));
    }
    return (this.bitfield & (PermissionFlagsBits[permission] ?? 0n)) !== 0n;
  }

  add(permission: Permission | Permission[]): this {
    if (Array.isArray(permission)) {
      for (const p of permission) {
        this.add(p);
      }
    } else {
      this.bitfield |= PermissionFlagsBits[permission] ?? 0n;
    }
    return this;
  }

  remove(permission: Permission | Permission[]): this {
    if (Array.isArray(permission)) {
      for (const p of permission) {
        this.remove(p);
      }
    } else {
      this.bitfield &= ~(PermissionFlagsBits[permission] ?? 0n);
    }
    return this;
  }

  reset(permissions: bigint | Permission | Permission[] = 0n): this {
    if (Array.isArray(permissions)) {
      this.bitfield = permissions.reduce((acc, p) => acc | (PermissionFlagsBits[p] ?? 0n), 0n);
    } else if (typeof permissions === 'string') {
      this.bitfield = PermissionFlagsBits[permissions] ?? 0n;
    } else {
      this.bitfield = permissions;
    }
    return this;
  }

  toArray(): Permission[] {
    const result: Permission[] = [];
    for (const [key, value] of Object.entries(PermissionFlagsBits)) {
      if ((this.bitfield & value) !== 0n) {
        result.push(key as Permission);
      }
    }
    return result;
  }

  toJSON(): bigint {
    return this.bitfield;
  }

  toString(): string {
    return this.bitfield.toString();
  }

  valueOf(): bigint {
    return this.bitfield;
  }

  get bitfieldValue(): bigint {
    return this.bitfield;
  }

  static all(): bigint {
    let result = 0n;
    for (const value of Object.values(PermissionFlagsBits)) {
      result |= value;
    }
    return result;
  }

  static none(): bigint {
    return 0n;
  }
}
