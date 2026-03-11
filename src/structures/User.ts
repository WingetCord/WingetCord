import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';
type AnyClient = any;

export class User extends BaseStructure {
  public readonly id: string;
  public readonly username: string;
  public readonly discriminator: string;
  public readonly avatar: string | null;
  public readonly bot: boolean | undefined;

  constructor(
    client: AnyClient,
    data: {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      bot?: boolean;
    }
  ) {
    super(client);
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.bot = data.bot;
  }

  get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  get mention(): string {
    return `<@${this.id}>`;
  }

  override toString(): string {
    return `<@${this.id}>`;
  }
}
