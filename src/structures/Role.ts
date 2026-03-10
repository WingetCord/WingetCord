import { BaseStructure } from './Base.js';
import type { Client } from '../core/Client.js';
import { PermissionsBitField } from '../utils/BitField.js';

export class Role extends BaseStructure {
  public id!: string;
  public name!: string;
  public color!: number;
  public hoist!: boolean;
  public icon?: string | null;
  public unicodeEmoji?: string | null;
  public position!: number;
  public permissions!: PermissionsBitField;
  public managed!: boolean;
  public mentionable!: boolean;
  public tags?: any;

  constructor(client: Client, data: any) {
    super(client);
    this.patch(data);
  }

  patch(data: any) {
    if ('id' in data) this.id = data.id;
    if ('name' in data) this.name = data.name;
    if ('color' in data) this.color = data.color;
    if ('hoist' in data) this.hoist = data.hoist;
    if ('icon' in data) this.icon = data.icon;
    if ('unicode_emoji' in data) this.unicodeEmoji = data.unicode_emoji;
    if ('position' in data) this.position = data.position;
    if ('permissions' in data) this.permissions = new PermissionsBitField(BigInt(data.permissions));
    if ('managed' in data) this.managed = data.managed;
    if ('mentionable' in data) this.mentionable = data.mentionable;
    if ('tags' in data) this.tags = data.tags;
  }

  get hexColor() {
    return `#${this.color.toString(16).padStart(6, '0')}`;
  }

  toString() {
    return `<@&${this.id}>`;
  }
}
