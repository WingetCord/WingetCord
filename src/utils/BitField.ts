/**
 * BitField - Utility for bitwise operations
 */
export class BitField {
  private bits: number;

  constructor(bits: number = 0) {
    this.bits = bits;
  }

  /**
   * Check if a bit is set
   */
  has(bit: number): boolean {
    return (this.bits & bit) === bit;
  }

  /**
   * Add a bit
   */
  add(bit: number): this {
    this.bits |= bit;
    return this;
  }

  /**
   * Remove a bit
   */
  remove(bit: number): this {
    this.bits &= ~bit;
    return this;
  }

  /**
   * Toggle a bit
   */
  toggle(bit: number): this {
    this.bits ^= bit;
    return this;
  }

  /**
   * Get the raw bit value
   */
  valueOf(): number {
    return this.bits;
  }

  /**
   * Get the raw bit value as string
   */
  toString(): string {
    return this.bits.toString();
  }

  /**
   * Get all set bits as array
   */
  toArray(): number[] {
    const bits: number[] = [];
    let temp = this.bits;
    let i = 0;
    while (temp > 0) {
      if (temp & 1) {
        bits.push(1 << i);
      }
      temp >>= 1;
      i++;
    }
    return bits;
  }

  /**
   * Check equality
   */
  equals(other: BitField): boolean {
    return this.bits === other.bits;
  }

  /**
   * Create from array of bits
   */
  static from(bits: number[]): BitField {
    const field = new BitField();
    for (const bit of bits) {
      field.add(bit);
    }
    return field;
  }
}
