/**
 * Type-safe Gateway types and utilities
 * Provides type inference for Gateway events and payloads
 */

// ============== Gateway OPCodes ==============

/**
 * Gateway opcode types
 */
export const OPCodes = {
  DISPATCH: 0,
  HEARTBEAT: 1,
  IDENTIFY: 2,
  PRESENCE_UPDATE: 3,
  VOICE_STATE_UPDATE: 4,
  VOICE_SERVER_PING: 5,
  RESUME: 6,
  RECONNECT: 7,
  REQUEST_GUILD_MEMBERS: 8,
  INVALID_SESSION: 9,
  HELLO: 10,
  HEARTBEAT_ACK: 11,
} as const;

export type OPCode = typeof OPCodes[keyof typeof OPCodes];

// ============== Gateway Intent Bits ==============

/**
 * Gateway intent bit definitions
 */
export const IntentBits = {
  // Guilds
  GUILDS: 1 << 0,
  GUILD_MEMBERS: 1 << 1,
  GUILD_BANS: 1 << 2,
  GUILD_EMOJIS_AND_STICKERS: 1 << 3,
  GUILD_INTEGRATIONS: 1 << 4,
  GUILD_WEBHOOKS: 1 << 5,
  GUILD_INVITES: 1 << 6,
  GUILD_VOICE_STATES: 1 << 7,
  GUILD_PRESENCES: 1 << 8,
  GUILD_MESSAGES: 1 << 9,
  GUILD_MESSAGE_REACTIONS: 1 << 10,
  GUILD_MESSAGE_TYPING: 1 << 11,
  DIRECT_MESSAGES: 1 << 12,
  DIRECT_MESSAGE_REACTIONS: 1 << 13,
  DIRECT_MESSAGE_TYPING: 1 << 14,
  MESSAGE_CONTENT: 1 << 15,
  GUILD_SCHEDULED_EVENTS: 1 << 16,
  GUILD_AUTO_MODERATION: 1 << 20,
  
  // Shortcuts
  ALL: -1,
  UNPRIVILEGED: 
    (1 << 0) | (1 << 3) | (1 << 4) | (1 << 5) | (1 << 6) | 
    (1 << 7) | (1 << 9) | (1 << 10) | (1 << 11) | (1 << 12) | 
    (1 << 13) | (1 << 14) | (1 << 16) | (1 << 20),
  PRIVILEGED: (1 << 1) | (1 << 8) | (1 << 15),
} as const;

export type IntentBit = typeof IntentBits[keyof typeof IntentBits];
export type IntentName = keyof typeof IntentBits;

/**
 * Check if an intent is set
 */
export function hasIntent(intents: number, intent: IntentName): boolean {
  return (intents & IntentBits[intent]) !== 0;
}

/**
 * Combine multiple intents
 */
export function calculateIntents(intents: IntentName[]): number {
  return intents.reduce((acc, intent) => acc | IntentBits[intent], 0);
}

// ============== Gateway Events ==============

/**
 * All Discord Gateway events
 */
export type GatewayEvent =
  | 'READY'
  | 'RESUMED'
  | 'CHANNEL_CREATE'
  | 'CHANNEL_UPDATE'
  | 'CHANNEL_DELETE'
  | 'CHANNEL_PINS_UPDATE'
  | 'GUILD_CREATE'
  | 'GUILD_UPDATE'
  | 'GUILD_DELETE'
  | 'GUILD_BAN_ADD'
  | 'GUILD_BAN_REMOVE'
  | 'GUILD_EMOJIS_UPDATE'
  | 'GUILD_INTEGRATIONS_UPDATE'
  | 'GUILD_MEMBER_ADD'
  | 'GUILD_MEMBER_UPDATE'
  | 'GUILD_MEMBER_REMOVE'
  | 'GUILD_MEMBERS_CHUNK'
  | 'GUILD_ROLE_CREATE'
  | 'GUILD_ROLE_UPDATE'
  | 'GUILD_ROLE_DELETE'
  | 'GUILD_SCHEDULED_EVENT_CREATE'
  | 'GUILD_SCHEDULED_EVENT_UPDATE'
  | 'GUILD_SCHEDULED_EVENT_DELETE'
  | 'GUILD_SCHEDULED_EVENT_USER_ADD'
  | 'GUILD_SCHEDULED_EVENT_USER_REMOVE'
  | 'INTEGRATION_CREATE'
  | 'INTEGRATION_UPDATE'
  | 'INTERACTION_CREATE'
  | 'INVITE_CREATE'
  | 'INVITE_DELETE'
  | 'MESSAGE_CREATE'
  | 'MESSAGE_UPDATE'
  | 'MESSAGE_DELETE'
  | 'MESSAGE_DELETE_BULK'
  | 'MESSAGE_REACTION_ADD'
  | 'MESSAGE_REACTION_REMOVE'
  | 'MESSAGE_REACTION_REMOVE_ALL'
  | 'MESSAGE_REACTION_REMOVE_EMOJI'
  | 'PRESENCE_UPDATE'
  | 'STAGE_INSTANCE_CREATE'
  | 'STAGE_INSTANCE_DELETE'
  | 'STAGE_INSTANCE_UPDATE'
  | 'THREAD_CREATE'
  | 'THREAD_UPDATE'
  | 'THREAD_DELETE'
  | 'THREAD_LIST_SYNC'
  | 'THREAD_MEMBER_UPDATE'
  | 'THREAD_MEMBERS_UPDATE'
  | 'USER_UPDATE'
  | 'VOICE_STATE_UPDATE'
  | 'VOICE_SERVER_UPDATE'
  | 'WEBHOOKS_UPDATE';

// ============== Gateway Payload Types ==============

/**
 * Base gateway payload
 */
export interface GatewayPayload {
  op: OPCode;
  d: unknown;
  s?: number | null;
  t?: string;
}

/**
 * Hello payload (op 10)
 */
export interface GatewayHelloPayload {
  heartbeat_interval: number;
  _trace?: string[];
}

/**
 * Heartbeat payload (op 1)
 */
export interface GatewayHeartbeatPayload {
  d: number | null;
}

/**
 * Identify payload (op 2)
 */
export interface GatewayIdentifyPayload {
  op: 2;
  d: GatewayIdentifyData;
}

export interface GatewayIdentifyData {
  token: string;
  intents: number;
  properties: {
    os: string;
    browser: string;
    device: string;
  };
  compress?: boolean;
  large_threshold?: number;
  shard?: [number, number];
  presence?: GatewayPresenceUpdate;
  gateway_intents?: number;
}

/**
 * Resume payload (op 6)
 */
export interface GatewayResumePayload {
  op: 6;
  d: GatewayResumeData;
}

export interface GatewayResumeData {
  token: string;
  session_id: string;
  seq: number;
}

/**
 * Presence update payload (op 3)
 */
export interface GatewayPresenceUpdate {
  since: number | null;
  activities: GatewayActivity[];
  status: PresenceStatus;
  afk: boolean;
}

export type PresenceStatus = 'idle' | 'online' | 'dnd' | 'invisible';

/**
 * Activity for presence
 */
export interface GatewayActivity {
  name: string;
  type: number;
  url?: string | null;
  created_at: number;
  timestamps?: {
    start?: number;
    end?: number;
  };
  application_id?: string;
  details?: string | null;
  state?: string | null;
  emoji?: {
    name: string;
    id?: string;
    animated?: boolean;
  };
  party?: {
    id?: string;
    size?: [number, number];
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  secrets?: {
    join?: string;
    spectate?: string;
    match?: string;
  };
  instance?: boolean;
  flags?: number;
}

/**
 * Voice state update payload (op 4)
 */
export interface GatewayVoiceStateUpdatePayload {
  guild_id: string | null;
  channel_id: string | null;
  user_id: string;
  member?: unknown;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_video?: boolean;
  suppress?: boolean;
  request_to_speak_timestamp?: string | null;
}

/**
 * Request guild members (op 8)
 */
export interface GatewayRequestGuildMembers {
  guild_id: string | string[];
  query?: string;
  limit?: number;
  presences?: boolean;
  user_ids?: string | string[];
  nonce?: string;
}

// ============== Gateway Connection State ==============

/**
 * Gateway connection status
 */
export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'RESUMING'
  | 'WAITING_FOR_GUILD'
  | 'IDENTIFYING';

/**
 * Gateway connection state
 */
export interface GatewayState {
  status: ConnectionStatus;
  ping: number;
  sequence: number | null;
  sessionId: string | null;
  resumeUrl: string | null;
  shardId: number;
  shardCount: number;
  lastHeartbeat: number;
  missedHeartbeats: number;
}

// ============== Event Handler Types ==============

/**
 * Gateway event listener
 */
export type GatewayEventListener<_T extends GatewayEvent = GatewayEvent> = (
  data: unknown
) => void;

/**
 * Type-safe event emitter interface
 */
export interface TypedEventEmitter {
  on<T extends GatewayEvent>(event: T, listener: GatewayEventListener<T>): this;
  once<T extends GatewayEvent>(event: T, listener: GatewayEventListener<T>): this;
  off<T extends GatewayEvent>(event: T, listener: GatewayEventListener<T>): this;
  emit<T extends GatewayEvent>(event: T, data: unknown): boolean;
}
