import { BaseHandler } from './BaseHandler.js';

export class EmojiHandler extends BaseHandler {
  /**
   * List guild emojis.
   */
  async list(guildId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/emojis`);
  }

  /**
   * Get a guild emoji.
   */
  async get(guildId: string, emojiId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/emojis/${emojiId}`);
  }

  /**
   * Create a guild emoji.
   */
  async create(guildId: string, data: any) {
    return this.rest.request('POST', `/guilds/${guildId}/emojis`, data);
  }

  /**
   * Update a guild emoji.
   */
  async update(guildId: string, emojiId: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${guildId}/emojis/${emojiId}`, data);
  }

  /**
   * Delete a guild emoji.
   */
  async delete(guildId: string, emojiId: string) {
    return this.rest.request('DELETE', `/guilds/${guildId}/emojis/${emojiId}`);
  }
}
