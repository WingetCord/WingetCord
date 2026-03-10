import { BaseHandler } from './BaseHandler.js';

export class ChannelsHandler extends BaseHandler {
  async getChannel(id: string) {
    return this.rest.request('GET', `/channels/${id}`);
  }

  async sendMessage(id: string, data: any) {
    return this.rest.request('POST', `/channels/${id}/messages`, data);
  }

  async deleteMessage(channelId: string, messageId: string) {
    return this.rest.request('DELETE', `/channels/${channelId}/messages/${messageId}`);
  }

  async createThread(channelId: string, data: any) {
    return this.rest.request('POST', `/channels/${channelId}/threads`, data);
  }
}
