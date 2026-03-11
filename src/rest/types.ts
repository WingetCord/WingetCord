/**
 * Type-safe REST route builder for Discord API
 * Provides full type inference for all endpoints
 */

import type {
  RESTGetAPICurrentUserResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTGetAPIGuildResult,
  RESTPostAPIGuildsJSONBody,
  RESTGetAPIGuildChannelsResult,
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildMemberResult,
  RESTPutAPIGuildMemberJSONBody,
  RESTPatchAPIGuildMemberJSONBody,
  RESTGetAPIChannelMessagesResult,
  RESTGetAPIChannelMessageResult,
  RESTPostAPIChannelMessageJSONBody,
  RESTPatchAPIChannelMessageJSONBody,
  RESTGetAPIChannelMessagesQuery,
  RESTGetAPIChannelResult,
  RESTPatchAPIChannelJSONBody,
  RESTGetAPIWebhookResult,
  RESTPatchAPIWebhookJSONBody,
  RESTGetAPIApplicationCommandsResult,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPatchAPIApplicationCommandJSONBody,
  RESTPostAPIInteractionCallbackJSONBody,
  RESTGetAPIAuditLogResult,
  RESTGetAPIGuildEmojiResult,
  RESTGetAPIGuildEmojisResult,
  RESTPostAPIGuildEmojiJSONBody,
  RESTPatchAPIGuildEmojiJSONBody,
  RESTGetAPIStickerResult,
  RESTGetAPIGuildStickersResult,
  RESTPatchAPIGuildStickerJSONBody,
  RESTGetAPIGuildScheduledEventResult,
  RESTPostAPIGuildScheduledEventJSONBody,
  RESTPatchAPIGuildScheduledEventJSONBody,
  RESTGetAPIAutoModerationRulesResult,
  RESTGetAPIAutoModerationRuleResult,
  RESTPostAPIAutoModerationRuleJSONBody,
  RESTPatchAPIAutoModerationRuleJSONBody,
} from 'discord-api-types/v10';

// ============== Route Builder ==============

/**
 * Union of all valid Discord API routes
 */
export type Route =
  // Users
  | `/users/${string}`
  | '/users/@me'
  | `/users/@me/guilds/${string}`
  | '/users/@me/guilds'
  
  // Guilds
  | '/guilds'
  | `/guilds/${string}`
  | `/guilds/${string}/channels`
  | `/guilds/${string}/members`
  | `/guilds/${string}/members/${string}`
  | `/guilds/${string}/members/${string}/roles/${string}`
  | `/guilds/${string}/messages`
  | `/guilds/${string}/messages/${string}`
  | `/guilds/${string}/roles`
  | `/guilds/${string}/roles/${string}`
  | `/guilds/${string}/prune`
  | `/guilds/${string}/integrations`
  | `/guilds/${string}/invites`
  | `/guilds/${string}/widget`
  | `/guilds/${string}/vanity-url`
  | `/guilds/${string}/audit-logs`
  | `/guilds/${string}/emojis`
  | `/guilds/${string}/emojis/${string}`
  | `/guilds/${string}/stickers`
  | `/guilds/${string}/stickers/${string}`
  | `/guilds/${string}/scheduled-events`
  | `/guilds/${string}/scheduled-events/${string}`
  | `/guilds/${string}/auto-moderation/rules`
  | `/guilds/${string}/auto-moderation/rules/${string}`
  
  // Channels
  | '/channels'
  | `/channels/${string}`
  | `/channels/${string}/messages`
  | `/channels/${string}/messages/${string}`
  | `/channels/${string}/messages/${string}/reactions/${string}`
  | `/channels/${string}/messages/${string}/reactions/${string}/${string}`
  | `/channels/${string}/webhooks`
  | `/channels/${string}/webhooks/${string}`
  | `/channels/${string}/invites`
  | `/channels/${string}/typing`
  | `/channels/${string}/pins`
  | `/channels/${string}/pins/${string}`
  
  // Webhooks
  | '/webhooks'
  | `/webhooks/${string}`
  | `/webhooks/${string}/messages/${string}`
  | `/webhooks/${string}/github`
  | `/webhooks/${string}/slack`
  
  // Application Commands
  | `/applications/${string}/commands`
  | `/applications/${string}/commands/${string}`
  | `/applications/${string}/commands/${string}/permissions`
  | `/applications/${string}/guilds/${string}/commands`
  | `/applications/${string}/guilds/${string}/commands/${string}`
  | `/applications/${string}/guilds/${string}/commands/${string}/permissions`
  
  // Interactions
  | `/interactions/${string}/${string}/callback`
  | `/webhooks/${string}/${string}/messages/@original`
  | `/webhooks/${string}/${string}/messages/${string}`
  
  // Guild Scheduled Events
  | `/guilds/${string}/scheduled-events/${string}/users`
  
  // Threads
  | `/channels/${string}/messages/${string}/threads`
  | `/channels/${string}/thread-members`
  | `/channels/${string}/thread-members/${string}`;

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Route metadata containing method and parameters
 */
export interface RouteMetadata {
  method: HttpMethod;
  route: string;
  hasMajorParam: boolean;
  majorParam?: string;
}

/**
 * Major parameters that require rate limit isolation
 */
export const MAJOR_PARAMETERS = ['channels', 'guilds', 'webhooks'] as const;
export type MajorParameter = typeof MAJOR_PARAMETERS[number];

/**
 * Parse a route and extract metadata
 */
export function parseRoute(route: string): RouteMetadata {
  const parts = route.split('/').filter(Boolean);
  let hasMajorParam = false;
  let majorParam: string | undefined;
  
  for (let i = 0; i < parts.length; i++) {
    if (MAJOR_PARAMETERS.includes(parts[i] as MajorParameter) && parts[i + 1]) {
      hasMajorParam = true;
      majorParam = parts[i + 1];
      break;
    }
  }
  
  return {
    method: 'GET' as HttpMethod,
    route,
    hasMajorParam,
    majorParam: majorParam ?? '',
  };
}

/**
 * Get the rate limit key for a route
 */
export function getRouteKey(method: HttpMethod, route: string): string {
  const parsed = parseRoute(route);
  if (parsed.hasMajorParam && parsed.majorParam) {
    const routeWithoutParams = route.replace(parsed.majorParam, ':id');
    return `${method}:${routeWithoutParams}`;
  }
  return `${method}:${route}`;
}

// ============== Query Builder ==============

/**
 * Query parameter builder
 */
export class QueryBuilder {
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams();
  }

  add(key: string, value: string | number | boolean | undefined | null): this {
    if (value !== undefined && value !== null) {
      this.params.append(key, String(value));
    }
    return this;
  }

  addIf(condition: boolean, key: string, value: string | number | boolean): this {
    if (condition) {
      return this.add(key, value);
    }
    return this;
  }

  toString(): string {
    return this.params.toString();
  }

  toRecord(): Record<string, string> {
    return Object.fromEntries(this.params);
  }
}

// ============== Re-exports ==============

export type {
  RESTGetAPICurrentUserResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTGetAPIGuildResult,
  RESTPostAPIGuildsJSONBody,
  RESTGetAPIGuildChannelsResult,
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildMemberResult,
  RESTPutAPIGuildMemberJSONBody,
  RESTPatchAPIGuildMemberJSONBody,
  RESTGetAPIChannelMessagesResult,
  RESTGetAPIChannelMessageResult,
  RESTPostAPIChannelMessageJSONBody,
  RESTPatchAPIChannelMessageJSONBody,
  RESTGetAPIChannelMessagesQuery,
  RESTGetAPIChannelResult,
  RESTPatchAPIChannelJSONBody,
  RESTGetAPIWebhookResult,
  RESTPatchAPIWebhookJSONBody,
  RESTGetAPIApplicationCommandsResult,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPatchAPIApplicationCommandJSONBody,
  RESTPostAPIInteractionCallbackJSONBody,
  RESTGetAPIAuditLogResult,
  RESTGetAPIGuildEmojiResult,
  RESTGetAPIGuildEmojisResult,
  RESTPostAPIGuildEmojiJSONBody,
  RESTPatchAPIGuildEmojiJSONBody,
  RESTGetAPIStickerResult,
  RESTGetAPIGuildStickersResult,
  RESTPatchAPIGuildStickerJSONBody,
  RESTGetAPIGuildScheduledEventResult,
  RESTPostAPIGuildScheduledEventJSONBody,
  RESTPatchAPIGuildScheduledEventJSONBody,
  RESTGetAPIAutoModerationRulesResult,
  RESTGetAPIAutoModerationRuleResult,
  RESTPostAPIAutoModerationRuleJSONBody,
  RESTPatchAPIAutoModerationRuleJSONBody,
} from 'discord-api-types/v10';
