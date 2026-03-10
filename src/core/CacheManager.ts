import { Guild } from '../structures/Guild.js';
import { Member } from '../structures/Member.js';
import { Role } from '../structures/Role.js';

export class Cache<T> extends Map<string, T> {
  private maxSize: number;
  private ttls = new Map<string, number>();
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 3600000) {
    super();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl = this.defaultTTL): this {
    if (this.size >= this.maxSize) {
      const firstKey = this.keys().next().value;
      if (firstKey) this.delete(firstKey);
    }
    this.ttls.set(key, Date.now() + ttl);
    return super.set(key, value);
  }

  get(key: string): T | undefined {
    const expiry = this.ttls.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return undefined;
    }
    return super.get(key);
  }

  delete(key: string): boolean {
    this.ttls.delete(key);
    return super.delete(key);
  }
}

export interface Channel {
  id: string;
  name: string;
  type: number;
  [key: string]: unknown;
}

export interface Emoji {
  id: string;
  name: string;
  [key: string]: unknown;
}

export class CacheManager {
  guilds = new Cache<Guild>(100);
  channels = new Cache<Channel>(500);
  members = new Map<string, Cache<Member>>();
  roles = new Map<string, Cache<Role>>();
  emojis = new Map<string, Cache<Emoji>>();
  messages = new Cache<unknown>(1000, 600000);

  getMember(guildId: string, userId: string) {
    return this.members.get(guildId)?.get(userId);
  }

  setMember(guildId: string, member: Member) {
    if (!this.members.has(guildId)) {
      this.members.set(guildId, new Cache<Member>(1000));
    }
    this.members.get(guildId)!.set(member.user!.id, member);
  }

  invalidateGuild(guildId: string) {
    this.guilds.delete(guildId);
    this.members.delete(guildId);
    this.roles.delete(guildId);
    this.emojis.delete(guildId);
  }
}
