/**
 * BitField utility for managing Discord's bitfield-based values (Permissions, Intents, etc.)
 */
export class BitField {
  public bitfield: bigint;

  constructor(bits: bigint | number | string | BitField = 0n) {
    this.bitfield = this.resolve(bits);
  }

  /**
   * Check if the bitfield has one or more specific bits.
   */
  has(bits: bigint | number | string | BitField): boolean {
    const resolved = this.resolve(bits);
    return (this.bitfield & resolved) === resolved;
  }

  /**
   * Add bits to the bitfield.
   */
  add(...bits: (bigint | number | string | BitField)[]): BitField {
    for (const bit of bits) {
      this.bitfield |= this.resolve(bit);
    }
    return this;
  }

  /**
   * Remove bits from the bitfield.
   */
  remove(...bits: (bigint | number | string | BitField)[]): BitField {
    for (const bit of bits) {
      this.bitfield &= ~this.resolve(bit);
    }
    return this;
  }

  /**
   * Resolve bits to a bigint. Override in child classes for custom flags.
   */
  protected resolve(bits: bigint | number | string | BitField): bigint {
    if (typeof bits === 'bigint') return bits;
    if (typeof bits === 'number') return BigInt(bits);
    if (typeof bits === 'string') return BigInt(bits);
    if (bits instanceof BitField) return bits.bitfield;
    return 0n;
  }

  toJSON() {
    return this.bitfield.toString();
  }
}

import { PermissionFlags } from './Enums.js';

export class PermissionsBitField extends BitField {
  static Flags = PermissionFlags;

  protected override resolve(bits: any): bigint {
    if (typeof bits === 'string' && bits in PermissionFlags) {
      return (PermissionFlags as any)[bits];
    }
    return super.resolve(bits);
  }

  /**
   * Helper to check for Administrative override.
   */
  override has(bits: any): boolean {
    if ((this.bitfield & PermissionFlags.Administrator) === PermissionFlags.Administrator) return true;
    return super.has(bits);
  }
}
