import { BaseHandler } from './BaseHandler.js';

export class AuditLogsHandler extends BaseHandler {
  /**
   * Fetch audit logs for a guild.
   */
  async get(
    guildId: string,
    options: { user_id?: string; action_type?: number; before?: string; limit?: number } = {}
  ) {
    let query = '';
    if (Object.keys(options).length > 0) {
      query = '?' + new URLSearchParams(options as any).toString();
    }
    return this.rest.request('GET', `/guilds/${guildId}/audit-logs${query}`);
  }
}
