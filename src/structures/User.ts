import { BaseStructure } from './Base.js';
import type { Client } from '../core/Client.js';

export class User extends BaseStructure {
  public id!: string;
  public username!: string;
  public discriminator!: string;
  public globalName?: string | null;
  public avatar?: string | null;
  public bot?: boolean;
  public system?: boolean;
  public mfaEnabled?: boolean;
  public banner?: string | null;
  public accentColor?: number | null;
  public locale?: string;
  public verified?: boolean;
  public email?: string | null;
  public flags?: number;
  public premiumType?: number;
  public publicFlags?: number;

  constructor(client: Client, data: any) {
    super(client);
    this.patch(data);
  }

  patch(data: any) {
    if ('id' in data) this.id = data.id;
    if ('username' in data) this.username = data.username;
    if ('discriminator' in data) this.discriminator = data.discriminator;
    if ('global_name' in data) this.globalName = data.global_name;
    if ('avatar' in data) this.avatar = data.avatar;
    if ('bot' in data) this.bot = data.bot;
    if ('system' in data) this.system = data.system;
    if ('mfa_enabled' in data) this.mfaEnabled = data.mfa_enabled;
    if ('banner' in data) this.banner = data.banner;
    if ('accent_color' in data) this.accentColor = data.accent_color;
    if ('locale' in data) this.locale = data.locale;
    if ('verified' in data) this.verified = data.verified;
    if ('email' in data) this.email = data.email;
    if ('flags' in data) this.flags = data.flags;
    if ('premium_type' in data) this.premiumType = data.premium_type;
    if ('public_flags' in data) this.publicFlags = data.public_flags;
  }

  get tag() {
    return `${this.username}#${this.discriminator}`;
  }

  get displayAvatarURL() {
    if (!this.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number(this.id) % 5}.png`;
    return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${this.avatar.startsWith('a_') ? 'gif' : 'png'}`;
  }

  toString() {
    return `<@${this.id}>`;
  }
}
