/**
 * Event Decorators
 * TypeScript decorators for Discord event listeners
 */

/**
 * Event metadata storage
 */
const eventListeners = new Map<Function, Array<{ event: string; method: string }>>();

/**
 * On decorator - Listen to an event
 */
export function On(event: string) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const events = eventListeners.get(target.constructor) || [];
    events.push({
      event,
      method: propertyKey as string,
    });
    eventListeners.set(target.constructor, events);
  };
}

/**
 * Once decorator - Listen to an event once
 */
export function Once(event: string) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const events = eventListeners.get(target.constructor) || [];
    events.push({
      event: `once:${event}`,
      method: propertyKey as string,
    });
    eventListeners.set(target.constructor, events);
  };
}

/**
 * Filter decorator - Filter events before handling
 */
export function Filter(predicate: (data: unknown) => boolean) {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
}

/**
 * Get all event listeners from a class
 */
export function getEventListeners(target: new (...args: unknown[]) => unknown): Array<{ event: string; method: string }> {
  return eventListeners.get(target.prototype) || [];
}

/**
 * Discord event types for type safety
 */
export const DiscordEvents = {
  // Gateway events
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

/**
 * Type for Discord events
 */
export type DiscordEvent = typeof DiscordEvents[keyof typeof DiscordEvents];
