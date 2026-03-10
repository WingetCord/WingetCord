export class Cache<T> extends Map<string, T> {
  private maxSize: number;
  private ttls: Map<string, number> = new Map();
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 3600000) { // Default 1 hour
    super();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl: number = this.defaultTTL): this {
    if (this.size >= this.maxSize) {
      const firstKey = this.keys().next().value;
      if (firstKey !== undefined) this.delete(firstKey);
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

import { Guild } from '../structures/Guild.js';
import { Member } from '../structures/Member.js';
import { Role } from '../structures/Role.js';

export interface Channel { id: string; name: string; type: number; [key: string]: any }
export interface Emoji { id: string; name: string; [key: string]: any }

export class CacheManager {
  public guilds = new Cache<Guild>(100);
  public channels = new Cache<Channel>(500);
  public members = new Map<string, Cache<Member>>(); 
  public roles = new Map<string, Cache<Role>>();
  public emojis = new Map<string, Cache<Emoji>>();
  public messages = new Cache<any>(1000, 600000); // 10 mins for messages

  getMember(guildId: string, userId: string) {
    return this.members.get(guildId)?.get(userId);
  }

  setMember(guildId: string, member: Member) {
    if (!this.members.has(guildId)) this.members.set(guildId, new Cache<Member>(1000));
    this.members.get(guildId)!.set(member.user!.id, member);
  }

  invalidateGuild(guildId: string) {
    this.guilds.delete(guildId);
    this.members.delete(guildId);
    this.roles.delete(guildId);
    this.emojis.delete(guildId);
  }
}
