import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';
import { Channel, ChannelPayload } from './Channel.js';
import { Role, RolePayload } from './Role.js';
import { Member, GuildMemberPayload } from './Member.js';

export interface GuildPayload {
  id: string;
  name: string;
  icon: string | null;
  splash: string | null;
  discovery_splash: string | null;
  owner_id: string;
  region: string | null;
  afk_channel_id: string | null;
  afk_timeout: number;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  roles: RolePayload[];
  channels: ChannelPayload[];
  presences: Array<{
    user: { id: string };
    roles: string[];
    game: { name: string } | null;
    status: string;
  }>;
  max_presences: number | null;
  max_members: number;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: number;
  premium_subscription_count: number;
  preferred_locale: string;
  public_updates_channel_id: string | null;
  max_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export class Guild extends BaseStructure {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly splash: string | null;
  readonly ownerId: string;
  readonly region: string | null;
  readonly afkChannelId: string | null;
  readonly afkTimeout: number;
  readonly verificationLevel: number;
  readonly defaultMessageNotifications: number;
  readonly explicitContentFilter: number;
  readonly vanityUrlCode: string | null;
  readonly description: string | null;
  readonly banner: string | null;
  readonly premiumTier: number;
  readonly preferredLocale: string;
  readonly publicUpdatesChannelId: string | null;
  readonly maxMembers: number;
  private _channels: Map<string, Channel> = new Map();
  private _roles: Map<string, Role> = new Map();
  private _members: Map<string, Member> = new Map();

  constructor(client: Client, data: GuildPayload) {
    super(client);
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.splash = data.splash;
    this.ownerId = data.owner_id;
    this.region = data.region;
    this.afkChannelId = data.afk_channel_id;
    this.afkTimeout = data.afk_timeout;
    this.verificationLevel = data.verification_level;
    this.defaultMessageNotifications = data.default_message_notifications;
    this.explicitContentFilter = data.explicit_content_filter;
    this.vanityUrlCode = data.vanity_url_code;
    this.description = data.description;
    this.banner = data.banner;
    this.premiumTier = data.premium_tier;
    this.preferredLocale = data.preferred_locale;
    this.publicUpdatesChannelId = data.public_updates_channel_id;
    this.maxMembers = data.max_members;

    // Initialize channels and roles
    for (const channelData of data.channels ?? []) {
      const channel = new Channel(client, channelData);
      this._channels.set(channel.id, channel);
    }

    for (const roleData of data.roles ?? []) {
      const role = new Role(client, roleData);
      this._roles.set(role.id, role);
    }
  }

  get channels(): Map<string, Channel> {
    return this._channels;
  }

  get roles(): Map<string, Role> {
    return this._roles;
  }

  get members(): Map<string, Member> {
    return this._members;
  }

  get channelCount(): number {
    return this._channels.size;
  }

  get roleCount(): number {
    return this._roles.size;
  }

  get memberCount(): number {
    return this._members.size;
  }

  get createdAt(): Date {
    const timestamp = (BigInt(this.id) >> 22n) + 1420070400000n;
    return new Date(Number(timestamp));
  }

  get mention(): string {
    return `<@${this.id}>`;
  }

  addMember(userId: string, data: GuildMemberPayload): void {
    const member = new Member(this.client, data, this.id);
    this._members.set(userId, member);
  }

  addChannel(data: ChannelPayload): void {
    const channel = new Channel(this.client, data);
    this._channels.set(channel.id, channel);
  }

  addRole(data: RolePayload): void {
    const role = new Role(this.client, data);
    this._roles.set(role.id, role);
  }

  override toString(): string {
    return this.name;
  }
}
