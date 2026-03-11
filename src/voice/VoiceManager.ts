import { VoiceConnection } from './VoiceConnection.js';

export interface VoiceManagerOptions {
  maxConnections?: number;
}

export class VoiceManager {
  private connections = new Map<string, VoiceConnection>();
  private maxConnections: number;

  constructor(options: VoiceManagerOptions = {}) {
    this.maxConnections = options.maxConnections ?? 100;
  }

  async join(
    guildId: string,
    channelId: string,
    adapterCreator: unknown
  ): Promise<VoiceConnection> {
    const key = `${guildId}:${channelId}`;

    let connection = this.connections.get(key);
    if (connection) {
      return connection;
    }

    if (this.connections.size >= this.maxConnections) {
      throw new Error(`Maximum voice connections (${this.maxConnections}) reached`);
    }

    connection = new VoiceConnection(guildId, channelId);
    await connection.join(guildId, channelId, adapterCreator);
    this.connections.set(key, connection);

    return connection;
  }

  leave(guildId: string, channelId: string): boolean {
    const key = `${guildId}:${channelId}`;
    const connection = this.connections.get(key);

    if (!connection) {
      return false;
    }

    connection.disconnect();
    this.connections.delete(key);
    return true;
  }

  getConnection(guildId: string, channelId: string): VoiceConnection | undefined {
    const key = `${guildId}:${channelId}`;
    return this.connections.get(key);
  }

  hasConnection(guildId: string, channelId: string): boolean {
    const key = `${guildId}:${channelId}`;
    return this.connections.has(key);
  }

  getAllConnections(): Map<string, VoiceConnection> {
    return new Map(this.connections);
  }

  disconnectAll(): void {
    for (const [, connection] of this.connections) {
      connection.disconnect();
    }
    this.connections.clear();
  }
}
