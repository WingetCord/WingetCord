import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';

export interface RolePayload {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: {
    bot_id?: string;
    integration_id?: string;
    premium_subscriber?: null;
  };
}

export class Role extends BaseStructure {
  readonly id: string;
  readonly name: string;
  readonly color: number;
  readonly hoist: boolean;
  readonly icon: string | null;
  readonly unicodeEmoji: string | null;
  readonly position: number;
  readonly permissions: string;
  readonly managed: boolean;
  readonly mentionable: boolean;
  readonly botId: string | undefined;
  readonly integrationId: string | undefined;

  constructor(client: Client, data: RolePayload) {
    super(client);
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.hoist = data.hoist;
    this.icon = data.icon ?? null;
    this.unicodeEmoji = data.unicode_emoji ?? null;
    this.position = data.position;
    this.permissions = data.permissions;
    this.managed = data.managed;
    this.mentionable = data.mentionable;
    this.botId = data.tags?.bot_id;
    this.integrationId = data.tags?.integration_id;
  }

  get mention(): string {
    return `<@&${this.id}>`;
  }

  isHoisted(): boolean {
    return this.hoist;
  }

  isManaged(): boolean {
    return this.managed;
  }

  isMentionable(): boolean {
    return this.mentionable;
  }
}
