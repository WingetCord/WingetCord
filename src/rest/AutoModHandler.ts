import { BaseHandler } from './BaseHandler.js';

export class AutoModHandler extends BaseHandler {
  /**
   * List auto-moderation rules for a guild.
   */
  async listRules(guildId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/auto-moderation/rules`);
  }

  /**
   * Get an auto-moderation rule.
   */
  async getRule(guildId: string, ruleId: string) {
    return this.rest.request('GET', `/guilds/${guildId}/auto-moderation/rules/${ruleId}`);
  }

  /**
   * Create an auto-moderation rule.
   */
  async createRule(guildId: string, data: any) {
    return this.rest.request('POST', `/guilds/${guildId}/auto-moderation/rules`, data);
  }

  /**
   * Update an auto-moderation rule.
   */
  async updateRule(guildId: string, ruleId: string, data: any) {
    return this.rest.request('PATCH', `/guilds/${guildId}/auto-moderation/rules/${ruleId}`, data);
  }

  /**
   * Delete an auto-moderation rule.
   */
  async deleteRule(guildId: string, ruleId: string) {
    return this.rest.request('DELETE', `/guilds/${guildId}/auto-moderation/rules/${ruleId}`);
  }
}
