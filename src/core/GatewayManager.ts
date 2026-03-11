import WebSocket from 'ws';
import { Constants } from '../utils/Constants.js';
import { Logger } from './Logger.js';
import type { GatewayPayload } from '../types/payloads.js';
import { EventEmitter } from 'events';
import pako from 'pako';

export interface ShardOptions {
  id: number;
  total: number;
}

/**
 * GatewayManager: Handles WebSocket communication with Discord.
 * Optimized for resilience (Auto-reconnect, Session Resume) and performance (Pocket Rate Limiting, pako).
 */
export class GatewayManager extends EventEmitter {
  private ws?: WebSocket;
  private token: string;
  private intents: number;
  private shard?: ShardOptions;
  
  public status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING' = 'DISCONNECTED';
  public ping = 0;
  private lastHeartbeatSend = 0;
  
  private heartbeatInterval?: NodeJS.Timeout;
  private lastSequence: number | null = null;
  private sessionId: string | null = null;
  private resumeUrl: string | null = null;
  
  private isConnecting = false;

  // Rate Limiting: Discord allows 120 packets per 60 seconds (roughly 2 per second)
  private packetBucket = 120;
  private lastPacketFlush = Date.now();
  private packetQueue: any[] = [];
  private packetLoop?: NodeJS.Timeout;

  constructor(token: string, intents: number, shard?: ShardOptions) {
    super();
    this.token = token;
    this.intents = intents;
    if (shard !== undefined) this.shard = shard;
    this.startPacketLoop();
  }

  connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    const url = this.resumeUrl || Constants.GATEWAY_URL;
    Logger.info(`Connecting to Discord Gateway [Shard ${this.shard?.id ?? 0}]...`);
    
    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.isConnecting = false;
      this.status = 'CONNECTED';
      Logger.info(`Connected to Discord Gateway [Shard ${this.shard?.id ?? 0}]`);
    });

    this.ws.on('message', (data: any) => {
      let payload: GatewayPayload;
      
      try {
        if (data instanceof Buffer) {
          const decompressed = pako.inflate(data, { to: 'string' });
          payload = JSON.parse(decompressed);
        } else {
          payload = JSON.parse(data.toString());
        }
        this.handlePayload(payload);
      } catch (err: any) {
        Logger.error('Failed to parse gateway payload', err);
      }
    });

    this.ws.on('close', (code: number, reason: string) => {
      this.isConnecting = false;
      this.status = 'DISCONNECTED';
      Logger.warn(`Gateway connection closed [Shard ${this.shard?.id ?? 0}] (${code}): ${reason}`);
      this.handleClose(code);
    });

    this.ws.on('error', (err: Error) => {
      Logger.error(`Gateway Error [Shard ${this.shard?.id ?? 0}]: ${err.message}`);
    });
  }

  private handlePayload(payload: GatewayPayload) {
    if (payload.s) this.lastSequence = payload.s;

    switch (payload.op) {
      case 10: // Hello
        this.startHeartbeat((payload.d as { heartbeat_interval: number }).heartbeat_interval);
        if (this.sessionId && this.lastSequence) {
          this.resume();
        } else {
          this.identify();
        }
        break;
      case 11: // Heartbeat ACK
        this.ping = Date.now() - this.lastHeartbeatSend;
        Logger.debug(`Heartbeat acknowledged [Shard ${this.shard?.id ?? 0}] (${this.ping}ms)`);
        break;
      case 0: // Dispatch
        if (payload.t === 'READY') {
          this.sessionId = (payload.d as { session_id: string }).session_id;
          this.resumeUrl = (payload.d as { resume_gateway_url: string }).resume_gateway_url;
        }
        if (payload.t) {
          this.emit('dispatch', payload.t, payload.d);
          this.emit(payload.t, payload.d);
        }
        break;
      case 1: // Heartbeat Request
        this.sendHeartbeat();
        break;
      case 7: // Reconnect Request
        Logger.info('Received Reconnect request from Gateway');
        this.ws?.close(4000, 'Reconnect');
        break;
      case 9: // Invalid Session
        const resumable = payload.d as boolean;
        Logger.warn(`Invalid session. Resumable: ${resumable}`);
        if (!resumable) {
          this.sessionId = null;
          this.lastSequence = null;
        }
        this.identify();
        break;
    }
  }

  private startHeartbeat(interval: number) {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    setTimeout(() => {
      this.sendHeartbeat();
      this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), interval);
    }, Math.floor(Math.random() * interval));
  }

  private sendHeartbeat() {
    this.lastHeartbeatSend = Date.now();
    this.send(JSON.stringify({ op: 1, d: this.lastSequence }));
  }

  private identify() {
    Logger.info(`Identifying [Shard ${this.shard?.id ?? 0}]...`);
    this.send(JSON.stringify({
      op: 2,
      d: {
        token: this.token,
        intents: this.intents,
        shard: this.shard ? [this.shard.id, this.shard.total] : undefined,
        properties: {
          os: process.platform,
          browser: 'WingetCord',
          device: 'WingetCord',
        },
        compress: false,
      },
    }));
  }

  private resume() {
    Logger.info(`Resuming session ${this.sessionId}...`);
    this.send(JSON.stringify({
      op: 6,
      d: {
        token: this.token,
        session_id: this.sessionId,
        seq: this.lastSequence,
      },
    }));
  }

  /**
   * Send a payload to the gateway with internal rate limiting.
   */
  public send(data: string | object) {
    this.packetQueue.push(typeof data === 'string' ? data : JSON.stringify(data));
  }

  private startPacketLoop() {
    this.packetLoop = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastPacketFlush;
      
      // Regain 1 packet per 500ms (120 per 60s)
      this.packetBucket = Math.min(120, this.packetBucket + Math.floor(elapsed / 500));
      this.lastPacketFlush = now;

      while (this.packetQueue.length > 0 && this.packetBucket > 0) {
        const packet = this.packetQueue.shift();
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(packet);
          this.packetBucket--;
        }
      }
    }, 50);
  }

  private handleClose(code: number) {
    const resumableCodes = [4000, 4001, 4002, 4003, 4005, 4007, 4008, 4009];
    if (resumableCodes.includes(code) || code < 4000) {
      const wait = 5000;
      Logger.info(`Attempting to reconnect in ${wait/1000}s...`);
      setTimeout(() => this.connect(), wait);
    } else {
      Logger.error(`Fatal gateway error ${code}. Cannot reconnect.`);
    }
  }

  public destroy() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.packetLoop) clearInterval(this.packetLoop);
    this.ws?.close();
    this.removeAllListeners();
  }
}
