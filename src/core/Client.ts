import { EventEmitter } from 'events';
import type { ClientOptions } from '../types/index.js';
import { RESTManager } from './RESTManager.js';
import { GatewayManager } from './GatewayManager.js';
import { IntentBits } from '../utils/Constants.js';
import { Logger } from './Logger.js';
import { CacheManager } from './CacheManager.js';
import { CommandManager } from './CommandManager.js';
import { EventManager } from './EventManager.js';
import { PluginManager } from './PluginManager.js';
import { InteractionManager } from './InteractionManager.js';
import { VoiceManager } from '../voice/VoiceManager.js';
import { ReactiveStore } from '../utils/ReactiveStore.js';

export class Client extends EventEmitter {
  public token: string;
  public rest: RESTManager;
  public gateway: GatewayManager;
  public cache: CacheManager;
  public commands: CommandManager;
  public events: EventManager;
  public plugins: PluginManager;
  public interactions: InteractionManager;
  public voice: VoiceManager;
  public store: any;
  public user: any = null;

  constructor(options: ClientOptions) {
    super();
    this.token = options.token;
    
    let intentValue = 0;
    if (Array.isArray(options.intents)) {
      for (const intent of options.intents) {
        intentValue |= IntentBits[intent] || 0;
      }
    } else {
      intentValue = options.intents;
    }

    this.rest = new RESTManager(this);
    this.gateway = new GatewayManager(options.token, intentValue);
    this.cache = new CacheManager();
    this.commands = new CommandManager(this);
    this.events = new EventManager(this);
    this.plugins = new PluginManager(this);
    this.interactions = new InteractionManager(this);
    this.voice = new VoiceManager(this);
    this.store = new ReactiveStore().state;

    this.gateway.on('dispatch', (event: string, data: any) => {
      this.handleEvent(event, data);
    });
  }

  /**
   * High-level shortcut to send a message to a channel.
   */
  public async say(channelId: string, content: string | any) {
    return this.rest.channels.sendMessage(channelId, typeof content === 'string' ? { content } : content);
  }

  /**
   * Fluent listener for MESSAGE_CREATE events.
   */
  public onMessage(callback: (message: any) => any) {
    this.on('MESSAGE_CREATE', callback);
    return this;
  }

  /**
   * Fluent listener for INTERACTION_CREATE events.
   */
  public onInteraction(callback: (interaction: any) => any) {
    this.on('interaction', callback);
    return this;
  }

  /**
   * Fluent listener for READY event.
   */
  public onReady(callback: (user: any) => any) {
    this.on('READY', callback);
    return this;
  }

  /**
   * Get an instant health report of the bot.
   */
  public pulse() {
    return {
      status: this.gateway.status,
      ping: this.gateway.ping,
      uptime: process.uptime(),
      memory: process.memoryUsage().heapUsed / 1024 / 1024,
      guilds: this.cache.guilds.size
    };
  }

  private middlewares: ((ctx: any, next: () => Promise<void>) => any)[] = [];

  /**
   * Add middleware to the client flow.
   */
  public use(middleware: (ctx: any, next: () => Promise<void>) => any) {
    this.middlewares.push(middleware);
    return this;
  }

  public async login() {
    try {
      this.user = await this.rest.request('GET', '/users/@me');
      Logger.info(`Logged in as ${this.user.username}`);
      
      // Auto-sync slash commands
      await this.commands.syncSlashCommands();

      this.gateway.connect();
    } catch (error) {
      Logger.error('Failed to login:', error);
      throw error;
    }
  }

  private async handleEvent(event: string, data: any) {
    const ctx = { client: this, event, data, timestamp: Date.now() };
    
    let index = 0;
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        if (middleware) await middleware(ctx, next);
      } else {
        this.emit(event, data);
        this.emit('raw', event, data);
      }
    };

    await next().catch(err => Logger.error(`Middleware error on ${event}:`, err));
  }
}
