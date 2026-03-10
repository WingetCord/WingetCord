/**
 * Utility for parsing and managing Discord colors.
 */
export class Color {
  static resolve(color: string | number | [number, number, number]): number {
    if (typeof color === 'number') return color;
    if (Array.isArray(color)) return (color[0] << 16) + (color[1] << 8) + color[2];
    
    if (typeof color === 'string') {
      if (color.startsWith('#')) return parseInt(color.slice(1), 16);
      if (color.toLowerCase() === 'random') return Math.floor(Math.random() * 0xffffff);
    }

    return 0;
  }

  static toHex(color: number): string {
    return `#${color.toString(16).padStart(6, '0')}`;
  }

  static toRGB(color: number): [number, number, number] {
    return [
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff
    ];
  }
}
