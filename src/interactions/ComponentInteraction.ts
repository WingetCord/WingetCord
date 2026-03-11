import { BaseStructure } from '../structures/Base.js';
import type { Client } from '../client/Client.js';

export interface ComponentInteractionPayload {
  id: string;
  application_id: string;
  type: number;
  data: {
    custom_id: string;
    component_type: number;
    values?: string[];
  };
  guild_id?: string;
  channel_id: string;
  member?: {
    user: {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
    };
    nick?: string;
    roles: string[];
    joined_at: string;
  };
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  message: {
    id: string;
    channel_id: string;
    guild_id?: string;
    author: {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
    };
    content: string;
    timestamp: string;
  };
  token: string;
  version: number;
}

export class ComponentInteraction extends BaseStructure {
  readonly id: string;
  readonly applicationId: string;
  readonly type: number;
  readonly customId: string;
  readonly componentType: number;
  readonly values: string[];
  readonly guildId: string | undefined;
  readonly channelId: string;
  readonly userId: string;
  readonly messageId: string;
  readonly token: string;
  readonly version: number;

  constructor(client: Client, data: ComponentInteractionPayload) {
    super(client);
    this.id = data.id;
    this.applicationId = data.application_id;
    this.type = data.type;
    this.customId = data.data.custom_id;
    this.componentType = data.data.component_type;
    this.values = data.data.values ?? [];
    this.guildId = data.guild_id;
    this.channelId = data.channel_id;
    this.userId = data.user.id;
    this.messageId = data.message.id;
    this.token = data.token;
    this.version = data.version;
  }

  async deferUpdate(): Promise<void> {
    await this.client.rest.post(`/interactions/${this.id}/${this.token}/callback`, {
      type: 6, // DEFERRED_UPDATE_MESSAGE
    });
  }

  async reply(content: string): Promise<void> {
    await this.client.rest.post(`/interactions/${this.id}/${this.token}/callback`, {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: { content },
    });
  }

  async followUp(content: string): Promise<void> {
    await this.client.rest.post(`/webhooks/${this.applicationId}/${this.token}`, {
      content,
    });
  }
}
