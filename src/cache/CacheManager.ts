/**
 * Cache Manager - Central cache registry
 */
import type { GuildPayload, ChannelPayload, UserPayload, MemberPayload } from '../types/payloads.js';
import { TTLCache } from './TTLCache.js';

export class CacheManager {
  guilds = new TTLCache<string, GuildPayload>({ ttl: 300_000 });
  channels = new TTLCache<string, ChannelPayload>({ ttl: 300_000 });
  users = new TTLCache<string, UserPayload>({ ttl: 600_000 });
  members = new TTLCache<string, MemberPayload>({ ttl: 300_000 });
  messages = new TTLCache<string, unknown>({ ttl: 60_000 });

  /**
   * Get a guild from cache
   */
  getGuild(guildId: string): GuildPayload | undefined {
    return this.guilds.get(guildId);
  }

  /**
   * Set a guild in cache
   */
  setGuild(guild: GuildPayload): void {
    this.guilds.set(guild.id, guild);
  }

  /**
   * Delete a guild from cache
   */
  deleteGuild(guildId: string): boolean {
    return this.guilds.delete(guildId);
  }

  /**
   * Get a channel from cache
   */
  getChannel(channelId: string): ChannelPayload | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Set a channel in cache
   */
  setChannel(channel: ChannelPayload): void {
    this.channels.set(channel.id, channel);
  }

  /**
   * Delete a channel from cache
   */
  deleteChannel(channelId: string): boolean {
    return this.channels.delete(channelId);
  }

  /**
   * Get a user from cache
   */
  getUser(userId: string): UserPayload | undefined {
    return this.users.get(userId);
  }

  /**
   * Set a user in cache
   */
  setUser(user: UserPayload): void {
    this.users.set(user.id, user);
  }

  /**
   * Delete a user from cache
   */
  deleteUser(userId: string): boolean {
    return this.users.delete(userId);
  }

  /**
   * Get a member from cache
   */
  getMember(guildId: string, userId: string): MemberPayload | undefined {
    return this.members.get(`${guildId}:${userId}`);
  }

  /**
   * Set a member in cache
   */
  setMember(guildId: string, member: MemberPayload & { user: { id: string } }): void {
    this.members.set(`${guildId}:${member.user.id}`, member);
  }

  /**
   * Delete a member from cache
   */
  deleteMember(guildId: string, userId: string): boolean {
    return this.members.delete(`${guildId}:${userId}`);
  }

  /**
   * Invalidate all cache entries for a guild
   */
  invalidateGuild(guildId: string): void {
    this.guilds.delete(guildId);
    
    // Invalidate all channels belonging to this guild
    for (const key of this.channels.getAllKeys()) {
      const channel = this.channels.get(key);
      if (channel && channel.guild_id === guildId) {
        this.channels.delete(key);
      }
    }

    // Invalidate all members belonging to this guild
    for (const key of this.members.getAllKeys()) {
      if (key.startsWith(`${guildId}:`)) {
        this.members.delete(key);
      }
    }
  }

  /**
   * Invalidate all cache
   */
  invalidateAll(): void {
    this.guilds.clear();
    this.channels.clear();
    this.users.clear();
    this.members.clear();
    this.messages.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    guilds: number;
    channels: number;
    users: number;
    members: number;
    messages: number;
  } {
    return {
      guilds: this.guilds.size,
      channels: this.channels.size,
      users: this.users.size,
      members: this.members.size,
      messages: this.messages.size,
    };
  }
}
