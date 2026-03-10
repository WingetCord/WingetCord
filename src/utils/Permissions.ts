import { PermissionFlags } from './Enums.js';

/**
 * Permissions: WingetCord's unique permission system.
 * Provides fluent API for checking and managing Discord permissions.
 */
export class Permissions {
  private bitfield: bigint;

  constructor(bits: bigint | string | number = 0n) {
    this.bitfield = typeof bits === 'bigint' ? bits : BigInt(bits);
  }

  /**
   * Check if this permission set has the specified permission.
   */
  has(permission: bigint | string | number | Permissions): boolean {
    const bits = this.resolve(permission);
    return (this.bitfield & bits) === bits;
  }

  /**
   * Check if this permission set has any of the specified permissions.
   */
  hasAny(...permissions: (bigint | string | number | Permissions)[]): boolean {
    return permissions.some((p) => this.has(p));
  }

  /**
   * Check if this permission set has all of the specified permissions.
   */
  hasAll(...permissions: (bigint | string | number | Permissions)[]): boolean {
    return permissions.every((p) => this.has(p));
  }

  /**
   * Add permissions to this set.
   */
  add(...permissions: (bigint | string | number | Permissions)[]): this {
    for (const permission of permissions) {
      this.bitfield |= this.resolve(permission);
    }
    return this;
  }

  /**
   * Remove permissions from this set.
   */
  remove(...permissions: (bigint | string | number | Permissions)[]): this {
    for (const permission of permissions) {
      this.bitfield &= ~this.resolve(permission);
    }
    return this;
  }

  /**
   * Toggle a permission on/off.
   */
  toggle(permission: bigint | string | number | Permissions): this {
    const bits = this.resolve(permission);
    if (this.has(bits)) {
      this.bitfield &= ~bits;
    } else {
      this.bitfield |= bits;
    }
    return this;
  }

  /**
   * Get raw bitfield value.
   */
  toJSON(): string {
    return this.bitfield.toString();
  }

  /**
   * Get as BigInt.
   */
  toBigInt(): bigint {
    return this.bitfield;
  }

  /**
   * Get as number (may lose precision for large values).
   */
  toNumber(): number {
    return Number(this.bitfield);
  }

  /**
   * Resolve a permission to BigInt.
   */
  private resolve(permission: bigint | string | number | Permissions): bigint {
    if (permission instanceof Permissions) {
      return permission.bitfield;
    }
    if (typeof permission === 'bigint') {
      return permission;
    }
    if (typeof permission === 'number') {
      return BigInt(permission);
    }
    // String - could be a permission name or numeric string
    if (permission in PermissionFlags) {
      return (PermissionFlags as Record<string, bigint>)[permission] ?? 0n;
    }
    return BigInt(permission);
  }

  /**
   * Create from a permission flag name.
   */
  static from(permission: keyof typeof PermissionFlags): Permissions {
    return new Permissions(PermissionFlags[permission]);
  }

  /**
   * Check if user is administrator.
   */
  static isAdministrator(permissions: bigint | string | number): boolean {
    const bits = typeof permissions === 'bigint' ? permissions : BigInt(permissions);
    return (bits & PermissionFlags.Administrator) === PermissionFlags.Administrator;
  }

  /**
   * Get all available permission flags.
   */
  static get All(): typeof PermissionFlags {
    return PermissionFlags;
  }
}

/**
 * PermissionUtils: Static utilities for permissions.
 */
export class PermissionUtils {
  /**
   * Parse permission string like "ManageChannels,ManageGuild" to bitfield.
   */
  static parse(permissions: string): bigint {
    let bits = 0n;
    const perms = permissions.split(',').map((p) => p.trim());
    for (const perm of perms) {
      if (perm in PermissionFlags) {
        const flag = (PermissionFlags as Record<string, bigint>)[perm];
        if (flag) bits |= flag;
      }
    }
    return bits;
  }

  /**
   * Convert bitfield to array of permission names.
   */
  static toArray(bitfield: bigint | string | number): string[] {
    const bits = typeof bitfield === 'bigint' ? bitfield : BigInt(bitfield);
    const result: string[] = [];
    for (const [name, value] of Object.entries(PermissionFlags)) {
      if ((bits & value) === value) {
        result.push(name);
      }
    }
    return result;
  }

  /**
   * Check if a permission can be used in a specific context.
   */
  static canUse(permission: bigint, context: { guild?: boolean; dm?: boolean }): boolean {
    // Some permissions don't work in DMs
    const dmDisabled = [
      'ManageGuild',
      'ManageChannels',
      'ManageRoles',
      'ManageEmojisAndStickers',
      'ManageWebhooks',
      'ManageEvents',
      'ManageThreads',
      'CreatePublicThreads',
      'CreatePrivateThreads',
      'SendMessagesInThreads',
      'KickMembers',
      'BanMembers',
      'ModerateMembers',
    ];

    if (context.dm) {
      const permName = this.toArray(permission)[0];
      if (!permName) return true;
      return !dmDisabled.includes(permName);
    }
    return true;
  }
}
