import { BaseHandler } from './BaseHandler.js';

export class GuildsHandler extends BaseHandler {
  async getGuild(id: string) {
    return this.rest.request('GET', `/guilds/${id}`);
  }

  async editGuild(id: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${id}`, data);
  }

  // Members
  async getMembers(guildId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/members`);
  }

  async editMember(guildId: string, userId: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${guildId}/members/${userId}`, data);
  }

  // Roles
  async getRoles(guildId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/roles`);
  }

  async createRole(guildId: string, data: any) {
    return this.rest.request('POST', `/guilds/${guildId}/roles`, data);
  }

  async editRole(guildId: string, roleId: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${guildId}/roles/${roleId}`, data);
  }

  async deleteRole(guildId: string, roleId: string) {
    return this.rest.request('DELETE', `/guilds/${guildId}/roles/${roleId}`);
  }

  // Emojis
  async getEmojis(guildId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/emojis`);
  }

  async createEmoji(guildId: string, data: any) {
    return this.rest.request('POST', `/guilds/${guildId}/emojis`, data);
  }

  async editEmoji(guildId: string, emojiId: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${guildId}/emojis/${emojiId}`, data);
  }

  async deleteEmoji(guildId: string, emojiId: string) {
    return this.rest.request('DELETE', `/guilds/${guildId}/emojis/${emojiId}`);
  }
}
