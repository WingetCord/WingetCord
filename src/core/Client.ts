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

  private middlewares: ((ctx: any, next: () => Promise<void>) => Promise<void>)[] = [];

  /**
   * Add middleware to the client flow.
   */
  public use(middleware: (ctx: any, next: () => Promise<void>) => Promise<void>) {
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
    const ctx = { client: this, event, data };
    
    let index = -1;
    const next = async () => {
      index++;
      if (index < this.middlewares.length) {
        await this.middlewares[index](ctx, next);
      } else {
        this.emit(event, data);
        this.emit('raw', event, data);
      }
    };

    await next();
  }
}
