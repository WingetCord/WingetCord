/**
 * Client Events - Typed event map for Client
 */
export interface ClientEvents {
  ready: [client: unknown];
  messageCreate: [message: unknown];
  interactionCreate: [interaction: unknown];
  channelCreate: [channel: unknown];
  channelUpdate: [channel: unknown];
  channelDelete: [channel: unknown];
  guildCreate: [guild: unknown];
  guildUpdate: [guild: unknown];
  guildDelete: [guild: unknown];
  guildMemberAdd: [member: unknown];
  guildMemberUpdate: [member: unknown];
  guildMemberRemove: [member: unknown];
  voiceStateUpdate: [state: unknown];
  presenceUpdate: [presence: unknown];
  error: [error: Error];
}
