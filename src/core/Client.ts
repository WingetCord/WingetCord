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

    this.gateway.on('dispatch', (event: string, data: any) => {
      this.handleEvent(event, data);
    });
  }

  public async login() {
    try {
      this.user = await this.rest.request('GET', '/users/@me');
      Logger.info(`Logged in as ${this.user.username}`);
      this.gateway.connect();
    } catch (error) {
      Logger.error('Failed to login:', error);
      throw error;
    }
  }

  private handleEvent(event: string, data: any) {
    this.emit(event, data);
    this.emit('raw', event, data);
  }
}
