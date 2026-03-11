import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';
import { User } from './User.js';

export interface GuildMemberPayload {
  user?: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
  };
  nick?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
}

export class Member extends BaseStructure {
  public readonly user: User | undefined;
  public readonly nick: string | null;
  public readonly roles: string[];
  public readonly joinedAt: Date;
  public readonly premiumSince: Date | null;
  public readonly deaf: boolean;
  public readonly mute: boolean;
  public readonly flags: number;
  public readonly pending: boolean | undefined;
  public readonly permissions: string | undefined;

  constructor(client: Client, data: GuildMemberPayload, public readonly guildId: string) {
    super(client);
    this.user = data.user ? new User(client, data.user) : undefined;
    this.nick = data.nick ?? null;
    this.roles = data.roles;
    this.joinedAt = new Date(data.joined_at);
    this.premiumSince = data.premium_since ? new Date(data.premium_since) : null;
    this.deaf = data.deaf;
    this.mute = data.mute;
    this.flags = data.flags;
    this.pending = data.pending;
    this.permissions = data.permissions;
  }

  get displayName(): string {
    return this.nick ?? this.user?.username ?? 'Unknown';
  }

  get mention(): string {
    return `<@!${this.user?.id}>`;
  }

  hasRole(roleId: string): boolean {
    return this.roles.includes(roleId);
  }
}
