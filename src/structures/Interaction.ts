import type { Client } from '../core/Client.js';

export class Interaction {
  public id: string;
  public token: string;
  public type: number;
  public guildId?: string;
  public channelId?: string;
  public user: any;
  public data: any;
  public app_permissions?: string;

  constructor(protected client: Client, payload: any) {
    this.id = payload.id;
    this.token = payload.token;
    this.type = payload.type;
    this.guildId = payload.guild_id;
    this.channelId = payload.channel_id;
    this.user = payload.member?.user || payload.user;
    this.data = payload.data;
    this.app_permissions = payload.app_permissions;
  }

  /**
   * Respond to many interaction types with a message.
   */
  async reply(options: any) {
    const body = typeof options === 'string' ? { content: options } : options;
    return this.client.rest.request('POST', `/interactions/${this.id}/${this.token}/callback`, {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: body
    });
  }

  /**
   * Acknowledge an interaction to buy more time (15 mins).
   */
  async deferReply(ephemeral: boolean = false) {
    return this.client.rest.request('POST', `/interactions/${this.id}/${this.token}/callback`, {
      type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
      data: ephemeral ? { flags: 64 } : undefined
    });
  }

  /**
   * Edit the original response.
   */
  async editReply(options: any) {
    const body = typeof options === 'string' ? { content: options } : options;
    return this.client.rest.request('PATCH', `/webhooks/${this.client.user.id}/${this.token}/messages/@original`, body);
  }

  /**
   * Delete the original response.
   */
  async deleteReply() {
    return this.client.rest.request('DELETE', `/webhooks/${this.client.user.id}/${this.token}/messages/@original`);
  }

  /**
   * Send a followup message.
   */
  async followUp(options: any) {
    const body = typeof options === 'string' ? { content: options } : options;
    return this.client.rest.request('POST', `/webhooks/${this.client.user.id}/${this.token}`, body);
  }

  /**
   * Show a modal to the user.
   */
  async showModal(modal: any) {
    return this.client.rest.request('POST', `/interactions/${this.id}/${this.token}/callback`, {
      type: 9, // MODAL
      data: modal.toJSON?.() || modal
    });
  }
}

export class CommandInteraction extends Interaction {
  public commandName: string;
  public options: any[];

  constructor(client: Client, payload: any) {
    super(client, payload);
    this.commandName = payload.data.name;
    this.options = payload.data.options || [];
  }
}

export class ComponentInteraction extends Interaction {
  public customId: string;
  public componentType: number;
  public values?: string[];

  constructor(client: Client, payload: any) {
    super(client, payload);
    this.customId = payload.data.custom_id;
    this.componentType = payload.data.component_type;
    this.values = payload.data.values;
  }

  /**
   * Update the original message the component was attached to.
   */
  async update(options: any) {
    const body = typeof options === 'string' ? { content: options } : options;
    return this.client.rest.request('POST', `/interactions/${this.id}/${this.token}/callback`, {
      type: 7, // UPDATE_MESSAGE
      data: body
    });
  }

  /**
   * Defer updating the message.
   */
  async deferUpdate() {
    return this.client.rest.request('POST', `/interactions/${this.id}/${this.token}/callback`, {
      type: 6 // DEFERRED_UPDATE_MESSAGE
    });
  }
}
