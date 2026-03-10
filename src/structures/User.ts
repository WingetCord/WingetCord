import { BaseStructure } from './Base.js';
import type { Client } from '../core/Client.js';

export class User extends BaseStructure {
  id!: string;
  username!: string;
  discriminator!: string;
  globalName?: string | null;
  avatar?: string | null;
  bot?: boolean;
  system?: boolean;
  mfaEnabled?: boolean;
  banner?: string | null;
  accentColor?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premiumType?: number;
  publicFlags?: number;

  constructor(client: Client, data: unknown) {
    super(client);
    this.patch(data);
  }

  patch(data: unknown) {
    const d = data as Record<string, unknown>;
    if ('id' in d) this.id = d.id as string;
    if ('username' in d) this.username = d.username as string;
    if ('discriminator' in d) this.discriminator = d.discriminator as string;
    if ('global_name' in d) this.globalName = d.global_name as string | null;
    if ('avatar' in d) this.avatar = d.avatar as string | null;
    if ('bot' in d) this.bot = d.bot as boolean;
    if ('system' in d) this.system = d.system as boolean;
    if ('mfa_enabled' in d) this.mfaEnabled = d.mfa_enabled as boolean;
    if ('banner' in d) this.banner = d.banner as string | null;
    if ('accent_color' in d) this.accentColor = d.accent_color as number | null;
    if ('locale' in d) this.locale = d.locale as string;
    if ('verified' in d) this.verified = d.verified as boolean;
    if ('email' in d) this.email = d.email as string | null;
    if ('flags' in d) this.flags = d.flags as number;
    if ('premium_type' in d) this.premiumType = d.premium_type as number;
    if ('public_flags' in d) this.publicFlags = d.public_flags as number;
  }

  get tag() {
    return `${this.username}#${this.discriminator}`;
  }

  get displayAvatarURL() {
    if (!this.avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${Number(this.id) % 5}.png`;
    }
    const format = this.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${format}`;
  }

  toString() {
    return `<@${this.id}>`;
  }
}
