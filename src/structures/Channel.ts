import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';

export interface ChannelPayload {
  id: string;
  type: number;
  guild_id?: string;
  name: string | null;
  position?: number;
  permission_overwrites?: Array<{
    id: string;
    type: number;
    allow: string;
    deny: string;
  }>;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: Array<{
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  }>;
  icon?: string | null;
  owner_id?: string;
  application_id?: string;
  parent_id?: string | null;
  last_pin_timestamp?: string | null;
}

export class Channel extends BaseStructure {
  readonly id: string;
  readonly type: number;
  readonly guildId: string | undefined;
  readonly name: string | null;
  readonly position: number | undefined;
  readonly topic: string | null;
  readonly nsfw: boolean | undefined;
  readonly lastMessageId: string | null;
  readonly bitrate: number | undefined;
  readonly userLimit: number | undefined;
  readonly rateLimitPerUser: number | undefined;
  readonly parentId: string | null;

  constructor(client: Client, data: ChannelPayload) {
    super(client);
    this.id = data.id;
    this.type = data.type;
    this.guildId = data.guild_id;
    this.name = data.name;
    this.position = data.position;
    this.topic = data.topic ?? null;
    this.nsfw = data.nsfw;
    this.lastMessageId = data.last_message_id ?? null;
    this.bitrate = data.bitrate;
    this.userLimit = data.user_limit;
    this.rateLimitPerUser = data.rate_limit_per_user;
    this.parentId = data.parent_id ?? null;
  }

  isText(): boolean {
    return this.type === 0;
  }

  isVoice(): boolean {
    return this.type === 2;
  }

  isCategory(): boolean {
    return this.type === 4;
  }

  isNews(): boolean {
    return this.type === 5;
  }

  isStage(): boolean {
    return this.type === 13;
  }

  isDM(): boolean {
    return this.type === 1;
  }

  isGroupDM(): boolean {
    return this.type === 3;
  }
}
