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
import { HandlerManager } from './HandlerManager.js';
import { Message } from '../structures/Message.js';
import { User } from '../structures/User.js';

export interface ClientStore {
  [key: string]: unknown;
}

export class Client extends EventEmitter {
  public readonly token: string;
  public readonly rest: RESTManager;
  public readonly gateway: GatewayManager;
  public readonly cache: CacheManager;
  public readonly commands: CommandManager;
  public readonly events: EventManager;
  public readonly plugins: PluginManager;
  public readonly interactions: InteractionManager;
  public readonly handler: HandlerManager;
  public readonly voice: VoiceManager;
  public readonly store: ClientStore;
  public user: User | null = null;

  private readonly middlewares: ((ctx: unknown, next: () => Promise<void>) => unknown)[] = [];

  constructor(options: ClientOptions) {
    super();
    this.token = options.token;

    let intentValue = 0;
    if (Array.isArray(options.intents)) {
      for (const intent of options.intents) {
        intentValue |= IntentBits[intent as keyof typeof IntentBits] as number || 0;
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
    this.handler = new HandlerManager(this);
    this.voice = new VoiceManager();
    const reactiveStore = new ReactiveStore<ClientStore>({});
    this.store = reactiveStore.state;

    this.gateway.on('dispatch', (event: string, data: unknown) => {
      this.handleEvent(event, data);
    });
  }

  say(channelId: string, content: string | unknown) {
    return this.rest.channels.sendMessage(channelId, typeof content === 'string' ? { content } : content);
  }

  onMessage(callback: (message: unknown) => unknown): this {
    this.on('MESSAGE_CREATE', callback);
    return this;
  }

  onInteraction(callback: (interaction: unknown) => unknown): this {
    this.on('interaction', callback);
    return this;
  }

  onReady(callback: (user: User) => unknown): this {
    this.on('READY', callback);
    return this;
  }

  pulse() {
    return {
      status: this.gateway.status,
      ping: this.gateway.ping,
      uptime: process.uptime(),
      memory: process.memoryUsage().heapUsed / 1024 / 1024,
      guilds: this.cache.guilds.size,
    };
  }

  use(middleware: (ctx: unknown, next: () => Promise<void>) => unknown): this {
    this.middlewares.push(middleware);
    return this;
  }

  async login() {
    try {
      const rawUser = await this.rest.request('GET', '/users/@me');
      this.user = new User(this as unknown as import('../client/Client').Client, rawUser);
      Logger.info(`Logged in as ${this.user.username}`);

      await this.commands.syncSlashCommands();
      this.gateway.connect();
    } catch (error) {
      Logger.error('Failed to login:', error);
      throw error;
    }
  }

  private async handleEvent(event: string, data: unknown) {
    const ctx = { client: this, event, data, timestamp: Date.now() };

    let index = 0;
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        if (middleware) await middleware(ctx, next);
      } else {
        let eventData = data;
        if (event === 'MESSAGE_CREATE') {
          eventData = new Message(this as unknown as import('../client/Client').Client, data as Record<string, unknown>);
        }

        this.emit(event, eventData);
        this.emit('raw', event, data);
      }
    };

    await next().catch((err) => Logger.error(`Middleware error on ${event}:`, err));
  }
}
