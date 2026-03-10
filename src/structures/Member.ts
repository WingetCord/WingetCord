import { BaseStructure } from './Base.js';
import type { Client } from '../core/Client.js';
import { User } from './User.js';
import { PermissionsBitField } from '../utils/BitField.js';

export class Member extends BaseStructure {
  public user?: User;
  public nick?: string | null;
  public avatar?: string | null;
  public roles!: string[];
  public joinedAt!: string;
  public premiumSince?: string | null;
  public deaf!: boolean;
  public mute!: boolean;
  public flags!: number;
  public pending?: boolean;
  public permissions?: PermissionsBitField;
  public communicationDisabledUntil?: string | null;

  constructor(client: Client, data: any) {
    super(client);
    this.patch(data);
  }

  patch(data: any) {
    if ('user' in data) this.user = new User(this.client, data.user);
    if ('nick' in data) this.nick = data.nick;
    if ('avatar' in data) this.avatar = data.avatar;
    if ('roles' in data) this.roles = data.roles;
    if ('joined_at' in data) this.joinedAt = data.joined_at;
    if ('premium_since' in data) this.premiumSince = data.premium_since;
    if ('deaf' in data) this.deaf = data.deaf;
    if ('mute' in data) this.mute = data.mute;
    if ('flags' in data) this.flags = data.flags;
    if ('pending' in data) this.pending = data.pending;
    if ('permissions' in data && data.permissions) this.permissions = new PermissionsBitField(BigInt(data.permissions));
    if ('communication_disabled_until' in data) this.communicationDisabledUntil = data.communication_disabled_until;
  }

  get id() {
    return this.user?.id;
  }

  get displayName() {
    return this.nick || this.user?.globalName || this.user?.username;
  }

  toString() {
    return `<@${this.id}>`;
  }
}
