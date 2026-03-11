import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';

export interface MessagePayload {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
  };
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: Array<{
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  }>;
  mention_roles: string[];
  attachments: Array<{
    id: string;
    filename: string;
    content_type?: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number;
    width?: number;
  }>;
  embeds: Array<{
    type: string;
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: {
      text: string;
      icon_url?: string;
      proxy_icon_url?: string;
    };
    image?: {
      url: string;
      proxy_url: string;
      height?: number;
      width?: number;
    };
    thumbnail?: {
      url: string;
      proxy_url: string;
      height?: number;
      width?: number;
    };
    author?: {
      name: string;
      url?: string;
      icon_url?: string;
      proxy_icon_url?: string;
    };
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  }>;
  reactions?: Array<{
    count: number;
    me: boolean;
    emoji: {
      id: string | null;
      name: string;
      animated?: boolean;
    };
  }>;
  pinned: boolean;
  webhook_id?: string;
  type: number;
}

export class Message extends BaseStructure {
  readonly id: string;
  readonly channelId: string;
  readonly guildId: string | undefined;
  readonly author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
  };
  content: string;
  timestamp: Date;
  editedTimestamp: Date | null;
  tts: boolean;
  mentionEveryone: boolean;
  mentions: Array<{
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  }>;
  mentionRoles: string[];
  attachments: Attachment[];
  embeds: Embed[];
  reactions: Reaction[];
  pinned: boolean;
  type: number;
  webhookId: string | undefined;

  constructor(client: Client, data: MessagePayload) {
    super(client);
    this.id = data.id;
    this.channelId = data.channel_id;
    this.guildId = data.guild_id;
    this.author = data.author;
    this.content = data.content;
    this.timestamp = new Date(data.timestamp);
    this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
    this.tts = data.tts;
    this.mentionEveryone = data.mention_everyone;
    this.mentions = data.mentions;
    this.mentionRoles = data.mention_roles;
    this.attachments = data.attachments.map(a => new Attachment(a));
    this.embeds = data.embeds.map(e => new Embed(e));
    this.reactions = data.reactions?.map(r => new Reaction(r)) ?? [];
    this.pinned = data.pinned;
    this.type = data.type;
    this.webhookId = data.webhook_id;
  }

  async reply(content: string): Promise<Message> {
    const data = await this.client.rest.post<MessagePayload>(`/channels/${this.channelId}/messages`, {
      content,
      message_reference: { message_id: this.id, channel_id: this.channelId },
    });
    return new Message(this.client, data);
  }

  async delete(): Promise<void> {
    await this.client.rest.delete(`/channels/${this.channelId}/messages/${this.id}`);
  }

  async pin(): Promise<void> {
    await this.client.rest.put(`/channels/${this.channelId}/pins/${this.id}`);
  }

  async unpin(): Promise<void> {
    await this.client.rest.delete(`/channels/${this.channelId}/pins/${this.id}`);
  }

  async crosspost(): Promise<Message> {
    const data = await this.client.rest.post<MessagePayload>(`/channels/${this.channelId}/messages/${this.id}/crosspost`);
    return new Message(this.client, data);
  }
}

export class Attachment {
  readonly id: string;
  readonly filename: string;
  readonly contentType: string | undefined;
  readonly size: number;
  readonly url: string;
  readonly proxyUrl: string;
  readonly height: number | undefined;
  readonly width: number | undefined;

  constructor(data: MessagePayload['attachments'][0]) {
    this.id = data.id;
    this.filename = data.filename;
    this.contentType = data.content_type;
    this.size = data.size;
    this.url = data.url;
    this.proxyUrl = data.proxy_url;
    this.height = data.height;
    this.width = data.width;
  }
}

export class Embed {
  type: string;
  title: string | undefined;
  description: string | undefined;
  url: string | undefined;
  timestamp: Date | undefined;
  color: number | undefined;
  footer: EmbedFooter | undefined;
  image: EmbedImage | undefined;
  thumbnail: EmbedImage | undefined;
  author: EmbedAuthor | undefined;
  fields: EmbedField[] | undefined;

  constructor(data: MessagePayload['embeds'][0]) {
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.url = data.url;
    this.timestamp = data.timestamp ? new Date(data.timestamp) : undefined;
    this.color = data.color;
    this.footer = data.footer ? new EmbedFooter(data.footer) : undefined;
    this.image = data.image ? new EmbedImage(data.image) : undefined;
    this.thumbnail = data.thumbnail ? new EmbedImage(data.thumbnail) : undefined;
    this.author = data.author ? new EmbedAuthor(data.author) : undefined;
    this.fields = data.fields?.map(f => new EmbedField(f));
  }
}

export class EmbedFooter {
  text: string;
  iconUrl: string | undefined;
  proxyIconUrl: string | undefined;

  constructor(data: { text: string; icon_url?: string; proxy_icon_url?: string }) {
    this.text = data.text;
    this.iconUrl = data.icon_url;
    this.proxyIconUrl = data.proxy_icon_url;
  }
}

export class EmbedImage {
  url: string;
  proxyUrl: string;
  height: number | undefined;
  width: number | undefined;

  constructor(data: { url: string; proxy_url: string; height?: number; width?: number }) {
    this.url = data.url;
    this.proxyUrl = data.proxy_url;
    this.height = data.height;
    this.width = data.width;
  }
}

export class EmbedAuthor {
  name: string;
  url: string | undefined;
  iconUrl: string | undefined;
  proxyIconUrl: string | undefined;

  constructor(data: { name: string; url?: string; icon_url?: string; proxy_icon_url?: string }) {
    this.name = data.name;
    this.url = data.url;
    this.iconUrl = data.icon_url;
    this.proxyIconUrl = data.proxy_icon_url;
  }
}

export class EmbedField {
  name: string;
  value: string;
  inline: boolean | undefined;

  constructor(data: { name: string; value: string; inline?: boolean }) {
    this.name = data.name;
    this.value = data.value;
    this.inline = data.inline;
  }
}

export class Reaction {
  count: number;
  me: boolean;
  emoji: ReactionEmoji;

  constructor(data: { count: number; me: boolean; emoji: { id: string | null; name: string; animated?: boolean } }) {
    this.count = data.count;
    this.me = data.me;
    this.emoji = new ReactionEmoji(data.emoji);
  }
}

export class ReactionEmoji {
  id: string | null;
  name: string;
  animated: boolean | undefined;

  constructor(data: { id: string | null; name: string; animated?: boolean }) {
    this.id = data.id;
    this.name = data.name;
    this.animated = data.animated;
  }
}
