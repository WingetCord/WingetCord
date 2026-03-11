/**
 * WingetCord - Discord Framework for TypeScript
 * Main entry point
 */

// Import reflect-metadata first for decorator support
import 'reflect-metadata';

// Errors
export * from './errors/index.js';

// Types
export * from './types/index.js';

// Gateway
export * from './gateway/GatewayConstants.js';

// Utils
export { Collection } from './utils/Collection.js';
export { BitField } from './utils/BitField.js';
export { Color, DiscordColors } from './utils/Color.js';
export { Validator } from './utils/Validator.js';
export { PermissionsBitField, PermissionFlagsBits } from './utils/PermissionsBitField.js';

// Cache
export { TTLCache } from './cache/TTLCache.js';
export { LRUCache } from './cache/LRUCache.js';
export { LFUCache } from './cache/LFUCache.js';
export { CacheManager } from './cache/CacheManager.js';

// Decorators
export * from './decorators/EventDecorator.js';
export * from './decorators/CommandDecorator.js';

// Scheduler
export { Scheduler } from './scheduler/Scheduler.js';

// Metrics
export * from './metrics/Metrics.js';

// Client
export { Client } from './client/Client.js';
export type { ClientOptions } from './client/ClientOptions.js';
export type { ClientEvents } from './client/ClientEvents.js';

// REST
export { RESTManager } from './rest/RESTManager.js';

// Gateway
export { GatewayManager } from './gateway/GatewayManager.js';

// Voice
export { VoiceConnection } from './voice/VoiceConnection.js';
export { VoiceManager } from './voice/VoiceManager.js';

// Audio
export { AudioQueue, type RepeatMode } from './audio/AudioQueue.js';
export { Track, type TrackData } from './audio/Track.js';
export { AudioPlayer } from './audio/AudioPlayer.js';

// Interactions
export { InteractionManager } from './interactions/InteractionManager.js';
export type { Interaction, CommandInteraction, ComponentInteraction, AutocompleteInteraction, ModalSubmitInteraction } from './interactions/index.js';

// Commands
export { CommandManager } from './commands/CommandManager.js';
export type { Command, CommandContext } from './commands/index.js';

// Events
export { EventManager } from './events/EventManager.js';
export type { Event } from './events/index.js';

// Handlers
export { HandlerManager } from './handlers/HandlerManager.js';

// Builders
export { EmbedBuilder } from './builders/EmbedBuilder.js';
export { ButtonBuilder } from './builders/ButtonBuilder.js';
export { SelectMenuBuilder } from './builders/SelectMenuBuilder.js';
export { ActionRowBuilder } from './builders/ActionRowBuilder.js';
export { ModalBuilder } from './builders/ModalBuilder.js';
export { TextInputBuilder } from './builders/TextInputBuilder.js';

// Structures
export { BaseStructure } from './structures/Base.js';
export { User } from './structures/User.js';
export { Guild } from './structures/Guild.js';
export { Member } from './structures/Member.js';
export { Message } from './structures/Message.js';
export { Channel } from './structures/Channel.js';
export { Role } from './structures/Role.js';
export { Emoji } from './structures/Emoji.js';

// Plugins
export { PluginManager } from './plugins/PluginManager.js';
export type { Plugin } from './plugins/Plugin.js';

// Middleware
export { MiddlewarePipeline, type MiddlewareFn } from './middleware/MiddlewarePipeline.js';

// Logging
export { Logger, logger } from './logging/Logger.js';

// Package version
export const VERSION = '1.0.0';
