import { BaseStructure } from './Base.js';
import type { Client } from '../core/Client.js';
import { User } from './User.js';

export class Message extends BaseStructure {
  public id!: string;
  public channelId!: string;
  public author!: User;
  public content!: string;
  public timestamp!: string;
  public editedTimestamp?: string | null;
  public tts!: boolean;
  public mentionEveryone!: boolean;
  public mentions!: User[];
  public mentionRoles!: string[];
  public attachments!: any[];
  public embeds!: any[];
  public reactions?: any[];
  public nonce?: string | number;
  public pinned!: boolean;
  public webhookId?: string;
  public type!: number;

  constructor(client: Client, data: any) {
    super(client);
    this.patch(data);
  }

  patch(data: any) {
    if ('id' in data) this.id = data.id;
    if ('channel_id' in data) this.channelId = data.channel_id;
    if ('author' in data) this.author = new User(this.client, data.author);
    if ('content' in data) this.content = data.content;
    if ('timestamp' in data) this.timestamp = data.timestamp;
    if ('edited_timestamp' in data) this.editedTimestamp = data.edited_timestamp;
    if ('tts' in data) this.tts = data.tts;
    if ('mention_everyone' in data) this.mentionEveryone = data.mention_everyone;
    if ('mentions' in data) this.mentions = data.mentions.map((u: any) => new User(this.client, u));
    if ('mention_roles' in data) this.mentionRoles = data.mention_roles;
    if ('attachments' in data) this.attachments = data.attachments;
    if ('embeds' in data) this.embeds = data.embeds;
    if ('reactions' in data) this.reactions = data.reactions;
    if ('nonce' in data) this.nonce = data.nonce;
    if ('pinned' in data) this.pinned = data.pinned;
    if ('webhook_id' in data) this.webhookId = data.webhook_id;
    if ('type' in data) this.type = data.type;
  }

  async reply(content: any) {
    return this.client.say(this.channelId, content);
  }

  async delete() {
    return this.client.rest.channels.deleteMessage(this.channelId, this.id);
  }
}
