export * from './core/Client.js';
export * from './core/RESTManager.js';
export * from './core/GatewayManager.js';
export * from './core/Logger.js';
export * from './core/CommandManager.js';
export { Cache, CacheManager } from './core/CacheManager.js';
export * from './core/EventManager.js';
export { PluginManager } from './core/PluginManager.js';
export * from './core/InteractionManager.js';
export * from './core/HandlerManager.js';
export * from './voice/VoiceManager.js';
export * from './voice/AudioPlayer.js';

// Smart Caching System
export { LRUCache, LFUCache, TTLCache, CompositeCache, type ICache, type CacheEntry } from './cache/index.js';
export { MemoryCache, CacheManager as SmartCacheManager, type CacheAdapter, type CacheStats } from './cache/index.js';

// Plugin & Middleware System
export { Plugin, PluginState, createPluginMetadata, type PluginMetadata, type ConfigField } from './plugins/index.js';
export { PluginLoader, type LoadOptions, type LoadResult } from './plugins/index.js';
export { MiddlewareManager, type MiddlewareContext, type NextFunction, type MiddlewareFunction, createRateLimiter, createValidator, createLoggingMiddleware, createErrorHandler } from './middleware/index.js';

// Decorators
export { Command, Option, SubCommand, StringOption, NumberOption, IntegerOption, BooleanOption, UserOption, ChannelOption, RoleOption, Choices, Cooldown, Permissions, getCommandMetadata, getCommandOptions, getCooldown, getPermissions, scanCommands, type CommandOptions, type CommandOption, type DecoratedCommand } from './decorators/index.js';
export { On, Once, Filter, getEventListeners, DiscordEvents, type DiscordEvent } from './decorators/index.js';

// Logging & Metrics
export { Logger, logger, createLogger, LogLevel, type LoggerOptions, type LogContext } from './logging/index.js';
export { MetricsRegistry, Counter, Gauge, Histogram, metrics, commandCounter, commandLatency, gatewayLatency, activeGuilds, cacheHitRatio, memoryUsage, type MetricType, type MetricValue } from './metrics/index.js';

// CLI & DX Tools
export { runCLI, initProject, makeCommand, makePlugin, makeEvent, makeMiddleware } from './cli/index.js';
export type { CLIOptions, PluginOptions, EventOptions, MiddlewareOptions } from './cli/index.js';

// Scheduler System
export { Scheduler, CronParser, type TaskOptions, type ScheduledTask, type TaskFunction, type TaskContext, type SchedulerOptions, type TaskType, type TaskStatus } from './scheduler/index.js';

// Audio System
export { AudioPlayer, AudioQueue, type AudioTrack, type AudioFilters, type AudioQueueOptions, type AudioPlayerOptions, type AudioSourceType, type RepeatMode, type PlayerStatus, type QueueHistoryEntry } from './audio/index.js';

// Type-safe utilities (use explicit exports to avoid conflicts)
export { OPCodes, IntentBits, hasIntent, calculateIntents, type GatewayEvent } from './gateway/types.js';
export { QueryBuilder, getRouteKey, type Route, type HttpMethod } from './rest/types.js';
export { InteractionHandler } from './core/HandlerManager.js';

export * from './structures/Interaction.js';
export * from './structures/Base.js';
export * from './structures/User.js';
export * from './structures/Message.js';
export * from './structures/Role.js';
export * from './structures/Member.js';
export * from './structures/Guild.js';

export * from './rest/GuildsHandler.js';
export * from './rest/ChannelsHandler.js';
export * from './rest/UsersHandler.js';
export * from './rest/EmojiHandler.js';
export * from './rest/StickerHandler.js';
export * from './rest/CommandsHandler.js';
export * from './rest/WebhooksHandler.js';
export * from './rest/AuditLogsHandler.js';
export * from './rest/AutoModHandler.js';
export * from './rest/ScheduledEventsHandler.js';

export * from './utils/EmbedBuilder.js';
export * from './utils/ComponentBuilders.js';
export * from './utils/Validator.js';
export * from './utils/Collector.js';
export * from './utils/Constants.js';
export * from './utils/ReactiveStore.js';
export * from './utils/Enums.js';
export * from './utils/BitField.js';
export * from './utils/ModalBuilder.js';
export * from './utils/Collection.js';
export * from './utils/Color.js';
export * from './utils/ContextMenuBuilders.js';
export * from './utils/Permissions.js';
export * from './utils/DiscordHelpers.js';

export * from './types/index.js';
