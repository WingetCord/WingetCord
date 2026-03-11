/**
 * Color - Utility for color manipulation
 */
export class Color {
  private r: number;
  private g: number;
  private b: number;

  constructor(r: number, g: number, b: number) {
    this.r = Math.max(0, Math.min(255, r));
    this.g = Math.max(0, Math.min(255, g));
    this.b = Math.max(0, Math.min(255, b));
  }

  /**
   * Create from hex string
   */
  static fromHex(hex: string): Color {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error('Invalid hex color');
    }
    return new Color(
      parseInt(result[1]!, 16),
      parseInt(result[2]!, 16),
      parseInt(result[3]!, 16)
    );
  }

  /**
   * Create from integer
   */
  static fromInt(value: number): Color {
    return new Color(
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff
    );
  }

  /**
   * Create from HSL
   */
  static fromHSL(h: number, s: number, l: number): Color {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  }

  get red(): number {
    return this.r;
  }

  get green(): number {
    return this.g;
  }

  get blue(): number {
    return this.b;
  }

  toHex(): string {
    const toHexComponent = (c: number): string => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHexComponent(this.r)}${toHexComponent(this.g)}${toHexComponent(this.b)}`;
  }

  toRGB(): [number, number, number] {
    return [this.r, this.g, this.b];
  }

  toInt(): number {
    return (this.r << 16) | (this.g << 8) | this.b;
  }

  toHSL(): [number, number, number] {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  mix(other: Color, weight: number = 0.5): Color {
    const w = Math.max(0, Math.min(1, weight));
    return new Color(
      Math.round(this.r * (1 - w) + other.r * w),
      Math.round(this.g * (1 - w) + other.g * w),
      Math.round(this.b * (1 - w) + other.b * w)
    );
  }

  lighten(amount: number): Color {
    const [, s, l] = this.toHSL();
    return Color.fromHSL(0, s, Math.min(100, l + amount));
  }

  darken(amount: number): Color {
    const [, s, l] = this.toHSL();
    return Color.fromHSL(0, s, Math.max(0, l - amount));
  }
}

export const DiscordColors = {
  BLURPLE: 0x5865F2,
  GREEN: 0x57F287,
  YELLOW: 0xFEE75C,
  FUCHSIA: 0xEB459E,
  RED: 0xED4245,
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  GREY: 0x99AAB5,
  DARK_GREY: 0x2C2F33,
  DARKER_GREY: 0x23272A,
} as const;
