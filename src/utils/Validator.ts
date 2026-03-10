import { Logger } from '../core/Logger.js';

/**
 * Validator: Robust data validation and sanitation.
 * strictly checks Discord payloads and user inputs.
 */
export class Validator {
  /**
   * Sanitizes string inputs to prevent mention spam or injection.
   */
  static sanitize(input: string): string {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>@!&]/g, (match) => {
      switch (match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '@': return '[@]';
        default: return match;
      }
    });
  }

  /**
   * Complex payload validation against required types.
   */
  static validate(payload: any, schema: Record<string, 'string' | 'number' | 'object' | 'boolean' | 'array'>): boolean {
    if (!payload || typeof payload !== 'object') return false;

    for (const [key, type] of Object.entries(schema)) {
      const val = payload[key];
      if (val === undefined) {
        Logger.warn(`Validation failed: Missing required field '${key}'`);
        return false;
      }

      const valType = Array.isArray(val) ? 'array' : typeof val;
      if (valType !== type) {
        Logger.warn(`Validation failed: Field '${key}' expected type '${type}', got '${valType}'`);
        return false;
      }
    }
    return true;
  }

  /**
   * Permission System: Bitwise comparison for hierarchy and overrides.
   */
  static hasPermissions(memberPermissions: string | bigint, required: bigint): boolean {
    const perms = BigInt(memberPermissions);
    // ADMINISTRATOR (1n << 3n) bypasses all
    if ((perms & (1n << 3n)) !== 0n) return true;
    return (perms & required) === required;
  }
}
