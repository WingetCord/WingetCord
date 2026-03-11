/**
 * Gateway Constants
 * Discord Gateway opcodes, close codes, and URLs
 */

export const GatewayOpcodes = {
  DISPATCH: 0,
  HEARTBEAT: 1,
  IDENTIFY: 2,
  PRESENCE_UPDATE: 3,
  VOICE_STATE_UPDATE: 4,
  RESUME: 6,
  RECONNECT: 7,
  REQUEST_GUILD_MEMBERS: 8,
  INVALID_SESSION: 9,
  HELLO: 10,
  HEARTBEAT_ACK: 11,
} as const;

export const GatewayCloseCodes = {
  UNKNOWN_ERROR: 4000,
  UNKNOWN_OPCODE: 4001,
  DECODE_ERROR: 4002,
  NOT_AUTHENTICATED: 4003,
  AUTHENTICATION_FAILED: 4004,
  ALREADY_AUTHENTICATED: 4005,
  INVALID_SEQUENCE: 4007,
  RATE_LIMITED: 4008,
  SESSION_TIMED_OUT: 4009,
  INVALID_SHARD: 4010,
  SHARDING_REQUIRED: 4011,
  INVALID_VERSION: 4012,
  INVALID_INTENTS: 4013,
  DISALLOWED_INTENTS: 4014,
} as const;

export const GATEWAY_VERSION = 10;
export const API_VERSION = 10;
export const BASE_URL = 'https://discord.com/api';
export const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json';
export const MAX_PACKET_RATE = 120;
export const PACKET_RATE_WINDOW_MS = 60_000;
export const MAX_RECONNECT_DELAY_MS = 32_000;
export const MAX_RATE_LIMIT_RETRIES = 5;
export const MAX_SERVER_ERROR_RETRIES = 3;
export const USER_AGENT = 'WingetCord (https://github.com/wingetcord/wingetcord, 1.0.0)';

export type GatewayOpcode = typeof GatewayOpcodes[keyof typeof GatewayOpcodes];
export type GatewayCloseCode = typeof GatewayCloseCodes[keyof typeof GatewayCloseCodes];
