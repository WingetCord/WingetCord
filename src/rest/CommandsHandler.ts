import { BaseHandler } from './BaseHandler.js';

export class CommandsHandler extends BaseHandler {
  async getGlobalCommands(applicationId: string) {
    return this.rest.request('GET', `/applications/${applicationId}/commands`);
  }

  async createGlobalCommand(applicationId: string, data: any) {
    return this.rest.request('POST', `/applications/${applicationId}/commands`, data);
  }

  async bulkOverwriteGlobalCommands(applicationId: string, data: any[]) {
    return this.rest.request('PUT', `/applications/${applicationId}/commands`, data);
  }

  async editGlobalCommand(applicationId: string, commandId: string, data: any) {
    return this.rest.request('PATCH', `/applications/${applicationId}/commands/${commandId}`, data);
  }

  async deleteGlobalCommand(applicationId: string, commandId: string) {
    return this.rest.request('DELETE', `/applications/${applicationId}/commands/${commandId}`);
  }

  async getGuildCommands(applicationId: string, guildId: string) {
    return this.rest.request('GET', `/applications/${applicationId}/guilds/${guildId}/commands`);
  }
}
