import { IntentBits } from '../utils/Constants.js';

export interface ClientOptions {
  token: string;
  intents: number | (keyof typeof IntentBits)[];
  shardId?: number;
  shardCount?: number;
}

export interface GatewayPayload {
  op: number;
  d: any;
  s?: number | null;
  t?: string;
}

export interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  after: number;
  bucket: string;
}

// ======= Discord API Types =======

export interface RESTOptions {
  baseURL?: string;
  version?: number;
  retries?: number;
  timeout?: number;
}

export interface APIRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  retryAfter?: number;
}

export interface MessagePayload {
  content?: string;
  embeds?: unknown[];
  components?: unknown[];
  tts?: boolean;
  files?: unknown[];
  attachments?: unknown[];
  flags?: number;
}

export interface EmbedPayload {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: { text: string; icon_url?: string };
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; url?: string; icon_url?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
}

export interface ComponentPayload {
  type: number;
  components?: ComponentPayload[];
  custom_id?: string;
  label?: string;
  style?: number;
  url?: string;
  disabled?: boolean;
  emoji?: { name: string; id?: string; animated?: boolean };
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  options?: { label: string; value: string; description?: string; emoji?: unknown; default?: boolean }[];
}

export interface InteractionResponsePayload {
  type: number;
  data?: {
    content?: string;
    embeds?: EmbedPayload[];
    components?: ComponentPayload[];
    flags?: number;
    choices?: { name: string; value: string | number }[];
  };
}

export interface GuildPayload {
  id: string;
  name: string;
  icon?: string;
  splash?: string;
  discovery_splash?: string;
  owner_id: string;
  region?: string;
  afk_channel_id?: string;
  afk_timeout: number;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  roles: unknown[];
  emojis: unknown[];
  features: string[];
  mfa_level: number;
  application_id?: string;
  system_channel_id?: string;
  rules_channel_id?: string;
  joined_at?: string;
  large?: boolean;
  member_count?: number;
  voice_states?: unknown[];
  members?: unknown[];
  channels?: unknown[];
  presences?: unknown[];
}

export interface UserPayload {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface MemberPayload {
  user?: UserPayload;
  nick?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
}

export interface ChannelPayload {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  name?: string;
  topic?: string;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  recipients?: UserPayload[];
  parent_id?: string;
}

export interface RolePayload {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string;
  unicode_emoji?: string;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}
