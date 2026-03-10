import { EventEmitter } from 'events';
import type { Client } from '../core/Client.js';
import { Logger } from '../core/Logger.js';

export class VoiceManager extends EventEmitter {
  private connections: Map<string, any> = new Map(); // guildId -> connection

  constructor(private client: Client) {
    super();
    this.client.on('VOICE_STATE_UPDATE', (data: any) => this.handleVoiceStateUpdate(data));
    this.client.on('VOICE_SERVER_UPDATE', (data: any) => this.handleVoiceServerUpdate(data));
  }

  /**
   * Request to join a voice channel.
   * Sends OP 4 to the Gateway.
   */
  async join(guildId: string, channelId: string, options: { mute?: boolean, deaf?: boolean } = {}) {
    Logger.info(`Joining voice channel ${channelId} in guild ${guildId}...`);
    this.client.gateway.send(JSON.stringify({
      op: 4,
      d: {
        guild_id: guildId,
        channel_id: channelId,
        self_mute: options.mute ?? false,
        self_deaf: options.deaf ?? false
      }
    }));
  }

  private handleVoiceStateUpdate(data: any) {
    // Handle internal voice state changes
    this.emit('stateUpdate', data);
  }

  private handleVoiceServerUpdate(data: any) {
    // Handle endpoint information for voice connection
    this.emit('serverUpdate', data);
  }
}
