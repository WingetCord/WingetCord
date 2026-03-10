import { BaseHandler } from './BaseHandler.js';

export class UsersHandler extends BaseHandler {
  async getMe() {
    return this.rest.request('GET', '/users/@me');
  }

  async getUser(id: string) {
    return this.rest.request('GET', `/users/${id}`);
  }
}
