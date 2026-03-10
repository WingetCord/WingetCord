import { BaseStructure } from './Base.js';
import type { Client } from '../core/Client.js';
import { Role } from './Role.js';

export class Guild extends BaseStructure {
  public id!: string;
  public name!: string;
  public icon?: string | null;
  public splash?: string | null;
  public discoverySplash?: string | null;
  public ownerId!: string;
  public afkChannelId?: string | null;
  public afkTimeout!: number;
  public widgetEnabled?: boolean;
  public widgetChannelId?: string | null;
  public verificationLevel!: number;
  public defaultMessageNotifications!: number;
  public explicitContentFilter!: number;
  public roles: Map<string, Role> = new Map();
  public emojis: any[] = [];
  public features: string[] = [];
  public mfaLevel!: number;
  public applicationId?: string | null;
  public systemChannelId?: string | null;
  public systemChannelFlags!: number;
  public rulesChannelId?: string | null;
  public maxPresences?: number | null;
  public maxMembers?: number;
  public vanityUrlCode?: string | null;
  public description?: string | null;
  public banner?: string | null;
  public premiumTier!: number;
  public premiumSubscriptionCount?: number;
  public preferredLocale!: string;
  public publicUpdatesChannelId?: string | null;
  public maxVideoChannelUsers?: number;
  public approximateMemberCount?: number;
  public approximatePresenceCount?: number;

  constructor(client: Client, data: any) {
    super(client);
    this.patch(data);
  }

  patch(data: any) {
    if ('id' in data) this.id = data.id;
    if ('name' in data) this.name = data.name;
    if ('icon' in data) this.icon = data.icon;
    if ('splash' in data) this.splash = data.splash;
    if ('discovery_splash' in data) this.discoverySplash = data.discovery_splash;
    if ('owner_id' in data) this.ownerId = data.owner_id;
    if ('afk_channel_id' in data) this.afkChannelId = data.afk_channel_id;
    if ('afk_timeout' in data) this.afkTimeout = data.afk_timeout;
    if ('widget_enabled' in data) this.widgetEnabled = data.widget_enabled;
    if ('widget_channel_id' in data) this.widgetChannelId = data.widget_channel_id;
    if ('verification_level' in data) this.verificationLevel = data.verification_level;
    if ('default_message_notifications' in data) this.defaultMessageNotifications = data.default_message_notifications;
    if ('explicit_content_filter' in data) this.explicitContentFilter = data.explicit_content_filter;
    if ('emojis' in data) this.emojis = data.emojis;
    if ('features' in data) this.features = data.features;
    if ('mfa_level' in data) this.mfaLevel = data.mfa_level;
    if ('application_id' in data) this.applicationId = data.application_id;
    if ('system_channel_id' in data) this.systemChannelId = data.system_channel_id;
    if ('system_channel_flags' in data) this.systemChannelFlags = data.system_channel_flags;
    if ('rules_channel_id' in data) this.rulesChannelId = data.rules_channel_id;
    if ('max_presences' in data) this.maxPresences = data.max_presences;
    if ('max_members' in data) this.maxMembers = data.max_members;
    if ('vanity_url_code' in data) this.vanityUrlCode = data.vanity_url_code;
    if ('description' in data) this.description = data.description;
    if ('banner' in data) this.banner = data.banner;
    if ('premium_tier' in data) this.premiumTier = data.premium_tier;
    if ('premium_subscription_count' in data) this.premiumSubscriptionCount = data.premium_subscription_count;
    if ('preferred_locale' in data) this.preferredLocale = data.preferred_locale;
    if ('public_updates_channel_id' in data) this.publicUpdatesChannelId = data.public_updates_channel_id;
    if ('max_video_channel_users' in data) this.maxVideoChannelUsers = data.max_video_channel_users;
    if ('approximate_member_count' in data) this.approximateMemberCount = data.approximate_member_count;
    if ('approximate_presence_count' in data) this.approximatePresenceCount = data.approximate_presence_count;

    if ('roles' in data) {
      for (const roleData of data.roles) {
        const role = new Role(this.client, roleData);
        this.roles.set(role.id, role);
      }
    }
  }

  get iconURL() {
    if (!this.icon) return null;
    return `https://cdn.discordapp.com/icons/${this.id}/${this.icon}.${this.icon.startsWith('a_') ? 'gif' : 'png'}`;
  }
}
