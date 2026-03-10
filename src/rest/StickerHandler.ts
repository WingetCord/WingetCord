import { BaseHandler } from './BaseHandler.js';

export class StickerHandler extends BaseHandler {
  /**
   * Get a sticker.
   */
  async get(stickerId: string) {
    return this.rest.request('GET', `/stickers/${stickerId}`);
  }

  /**
   * List sticker packs.
   */
  async listPacks() {
    return this.rest.request('GET', `/sticker-packs`);
  }

  /**
   * List guild stickers.
   */
  async listGuildStickers(guildId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/stickers`);
  }

  /**
   * Create a guild sticker.
   */
  async create(guildId: string, data: any) {
    return this.rest.request('POST', `/guilds/${guildId}/stickers`, data);
  }

  /**
   * Update a guild sticker.
   */
  async update(guildId: string, stickerId: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${guildId}/stickers/${stickerId}`, data);
  }

  /**
   * Delete a guild sticker.
   */
  async delete(guildId: string, stickerId: string) {
    return this.rest.request('DELETE', `/guilds/${guildId}/stickers/${stickerId}`);
  }
}
