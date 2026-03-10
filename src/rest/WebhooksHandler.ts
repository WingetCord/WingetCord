import { BaseHandler } from './BaseHandler.js';

export class WebhooksHandler extends BaseHandler {
  async getWebhook(id: string) {
    return this.rest.request('GET', `/webhooks/${id}`);
  }

  async createWebhook(channelId: string, data: any) {
    return this.rest.request('POST', `/channels/${channelId}/webhooks`, data);
  }

  async editWebhook(id: string, data: any) {
    return this.rest.request('PATCH', `/webhooks/${id}`, data);
  }

  async deleteWebhook(id: string) {
    return this.rest.request('DELETE', `/webhooks/${id}`);
  }
}
