/**
 * Gateway Manager - WebSocket lifecycle management
 */
import { EventEmitter } from 'events';
import { GATEWAY_URL, GatewayOpcodes } from './GatewayConstants.js';

export type GatewayStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING' | 'RESUMING';

export class GatewayManager extends EventEmitter {
  private _ws: unknown = null;
  private _sequence: number | null = null;
  private _sessionId: string | null = null;
  public status: GatewayStatus = 'DISCONNECTED';
  public ping = 0;

  constructor(private _token: string, private _intents: number) {
    super();
  }

  async connect(): Promise<void> {
    this.status = 'CONNECTING';
    console.log('[Gateway] Connecting...');
    // WebSocket connection would be established here
  }

  async disconnect(): Promise<void> {
    this.status = 'DISCONNECTED';
    console.log('[Gateway] Disconnected');
  }

  send(op: number, data: unknown): void {
    console.log(`[Gateway] Sending opcode ${op}:`, data);
  }
}
