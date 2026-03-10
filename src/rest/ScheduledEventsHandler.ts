import { BaseHandler } from './BaseHandler.js';

export class ScheduledEventsHandler extends BaseHandler {
  /**
   * List scheduled events for a guild.
   */
  async list(guildId: string, withUserCount: boolean = false) {
    return this.rest.request('GET', `/guilds/${guildId}/scheduled-events?with_user_count=${withUserCount}`);
  }

  /**
   * Create a scheduled event.
   */
  async create(guildId: string, data: any) {
    return this.rest.request('POST', `/guilds/${guildId}/scheduled-events`, data);
  }

  /**
   * Get a scheduled event.
   */
  async get(guildId: string, eventId: string, withUserCount: boolean = false) {
    return this.rest.request('GET', `/guilds/${guildId}/scheduled-events/${eventId}?with_user_count=${withUserCount}`);
  }

  /**
   * Update a scheduled event.
   */
  async update(guildId: string, eventId: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${guildId}/scheduled-events/${eventId}`, data);
  }

  /**
   * Delete a scheduled event.
   */
  async delete(guildId: string, eventId: string) {
    return this.rest.request('DELETE', `/guilds/${guildId}/scheduled-events/${eventId}`);
  }

  /**
   * Get event users.
   */
  async getUsers(guildId: string, eventId: string, options: { limit?: number; with_member?: boolean; before?: string; after?: string } = {}) {
    let query = '';
    if (Object.keys(options).length > 0) {
      query = '?' + new URLSearchParams(options as any).toString();
    }
    return this.rest.request('GET', `/guilds/${guildId}/scheduled-events/${eventId}/users${query}`);
  }
}
