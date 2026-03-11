import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';

export interface EmojiPayload {
  id: string | null;
  name: string | null;
  roles?: string[];
  user?: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export class Emoji extends BaseStructure {
  readonly id: string | null;
  readonly name: string | null;
  readonly roles: string[];
  readonly requireColons: boolean;
  readonly managed: boolean;
  readonly animated: boolean;
  readonly available: boolean;
  readonly userId: string | undefined;

  constructor(client: Client, data: EmojiPayload) {
    super(client);
    this.id = data.id;
    this.name = data.name;
    this.roles = data.roles ?? [];
    this.requireColons = data.require_colons ?? false;
    this.managed = data.managed ?? false;
    this.animated = data.animated ?? false;
    this.available = data.available ?? true;
    this.userId = data.user?.id;
  }

  get identifier(): string {
    if (this.id) {
      return this.animated ? `a:${this.name}:${this.id}` : `${this.name}:${this.id}`;
    }
    return this.name ?? '';
  }

  get url(): string {
    if (!this.id) return '';
    const ext = this.animated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/emojis/${this.id}.${ext}`;
  }

  get mention(): string {
    if (!this.id) return this.name ?? '';
    return this.animated ? `<a:${this.name}:${this.id}>` : `<:${this.name}:${this.id}>`;
  }

  isUnicode(): boolean {
    return this.id === null;
  }

  isAnimated(): boolean {
    return this.animated;
  }

  isAvailable(): boolean {
    return this.available;
  }
}
