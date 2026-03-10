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

  async joinThread(id: string) {
    return this.rest.request('PUT', `/channels/${id}/thread-members/@me`);
  }

  async leaveThread(id: string) {
    return this.rest.request('DELETE', `/channels/${id}/thread-members/@me`);
  }

  async addThreadMember(channelId: string, userId: string) {
    return this.rest.request('PUT', `/channels/${channelId}/thread-members/${userId}`);
  }

  async removeThreadMember(channelId: string, userId: string) {
    return this.rest.request('DELETE', `/channels/${channelId}/thread-members/${userId}`);
  }
}
