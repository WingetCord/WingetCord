import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Logger } from '../core/Logger.js';

/**
 * Encapsulates a connection to the Discord Voice Gateway.
 */
export class VoiceConnection extends EventEmitter {
  private ws?: WebSocket;
  private heartbeatInterval?: NodeJS.Timeout;
  
  constructor(
    public guildId: string,
    public endpoint: string,
    public token: string,
    public sessionId: string,
    public userId: string
  ) {
    super();
  }

  connect() {
    const url = `wss://${this.endpoint}/?v=4`;
    Logger.info(`Connecting to Voice Gateway: ${url}`);
    
    this.ws = new WebSocket(url);

    this.ws.on('open', () => this.identify());
    
    this.ws.on('message', (data: string) => {
      const payload = JSON.parse(data);
      this.handlePayload(payload);
    });

    this.ws.on('close', (code, reason) => {
      Logger.warn(`Voice Gateway closed (${code}): ${reason}`);
      this.stopHeartbeat();
    });
  }

  private handlePayload(payload: any) {
    switch (payload.op) {
      case 2: // Ready
        this.startHeartbeat(payload.d.heartbeat_interval);
        this.emit('ready', payload.d);
        break;
      case 4: // Session Description
        this.emit('sessionDescription', payload.d);
        break;
      case 8: // Hello
        this.startHeartbeat(payload.d.heartbeat_interval);
        break;
    }
  }

  private identify() {
    this.ws?.send(JSON.stringify({
      op: 0,
      d: {
        server_id: this.guildId,
        user_id: this.userId,
        session_id: this.sessionId,
        token: this.token
      }
    }));
  }

  private startHeartbeat(interval: number) {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.ws?.send(JSON.stringify({ op: 3, d: Date.now() }));
    }, interval);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  disconnect() {
    this.stopHeartbeat();
    this.ws?.close();
  }
}
