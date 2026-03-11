/**
 * Event Decorators
 * TypeScript decorators for Discord event listeners
 */
import { WingetCordError } from '../errors/WingetCordError.js';

/**
 * Event metadata storage - using Map instead of Reflect metadata to avoid type issues
 */
const eventMetadataStore = new Map<Function, { event: string; type: 'on' | 'once' }>();

/**
 * On decorator - Listen to an event every time it fires
 */
export function On(event: string) {
  return function (target: Function) {
    const existing = eventMetadataStore.get(target);
    if (existing) {
      throw new WingetCordError(
        `Cannot use @On and @Once on the same class. Use one or the other.`,
        'DECORATOR_CONFLICT'
      );
    }
    eventMetadataStore.set(target, { event, type: 'on' });
  };
}

/**
 * Once decorator - Listen to an event only the first time it fires
 */
export function Once(event: string) {
  return function (target: Function) {
    const existing = eventMetadataStore.get(target);
    if (existing) {
      throw new WingetCordError(
        `Cannot use @On and @Once on the same class. Use one or the other.`,
        'DECORATOR_CONFLICT'
      );
    }
    eventMetadataStore.set(target, { event, type: 'once' });
  };
}

/**
 * Get event metadata from a class
 */
export function getEventMetadata(target: Function): { event: string; type: 'on' | 'once' } | undefined {
  return eventMetadataStore.get(target);
}

/**
 * Discord event types for type safety
 */
export const DiscordEvents = {
  READY: 'READY',
  RESUMED: 'RESUMED',
  CHANNEL_CREATE: 'CHANNEL_CREATE',
  CHANNEL_UPDATE: 'CHANNEL_UPDATE',
  CHANNEL_DELETE: 'CHANNEL_DELETE',
  GUILD_CREATE: 'GUILD_CREATE',
  GUILD_UPDATE: 'GUILD_UPDATE',
  GUILD_DELETE: 'GUILD_DELETE',
  GUILD_MEMBER_ADD: 'GUILD_MEMBER_ADD',
  GUILD_MEMBER_UPDATE: 'GUILD_MEMBER_UPDATE',
  GUILD_MEMBER_REMOVE: 'GUILD_MEMBER_REMOVE',
  MESSAGE_CREATE: 'MESSAGE_CREATE',
  MESSAGE_UPDATE: 'MESSAGE_UPDATE',
  MESSAGE_DELETE: 'MESSAGE_DELETE',
  INTERACTION_CREATE: 'INTERACTION_CREATE',
  VOICE_STATE_UPDATE: 'VOICE_STATE_UPDATE',
  PRESENCE_UPDATE: 'PRESENCE_UPDATE',
} as const;

export type DiscordEvent = typeof DiscordEvents[keyof typeof DiscordEvents];
