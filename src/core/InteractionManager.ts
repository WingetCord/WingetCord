import { EventEmitter } from 'events';
import type { Client } from './Client.js';
import { Collector } from '../utils/Collector.js';
import type { CollectorOptions } from '../utils/Collector.js';
import { Logger } from './Logger.js';
import { Interaction, CommandInteraction, ComponentInteraction } from '../structures/Interaction.js';

/**
 * InteractionManager: Handles Slash Commands and MESSAGE_COMPONENT interactions.
 */
export class InteractionManager extends EventEmitter {
  private collectors: Set<Collector<any>> = new Set();

  constructor(private client: Client) {
    super();
    this.client.on('INTERACTION_CREATE', (payload: any) => this.handleInteraction(payload));
  }

  /**
   * Creates a dedicated collector for interactions.
   */
  createCollector<T = any>(options: CollectorOptions<T>): Collector<T> {
    const collector = new Collector<T>(options);
    this.collectors.add(collector);
    
    collector.once('end', () => {
      this.collectors.delete(collector);
      collector.removeAllListeners();
    });
    
    return collector;
  }

  private async handleInteraction(payload: any) {
    try {
      let interaction: Interaction;

      if (payload.type === 2) {
        interaction = new CommandInteraction(this.client, payload);
      } else if (payload.type === 3) {
        interaction = new ComponentInteraction(this.client, payload);
      } else {
        interaction = new Interaction(this.client, payload);
      }

      // 1. Check Collectors first
      for (const collector of this.collectors) {
        const id = payload.data?.custom_id || payload.id;
        if (collector.handle(interaction, id)) return;
      }

      // 2. Handle Events
      if (interaction instanceof CommandInteraction) {
        this.emit('command', interaction);
      } else if (interaction instanceof ComponentInteraction) {
        this.emit('component', interaction);
      }
      
      this.emit('interaction', interaction);

    } catch (err) {
      Logger.error('Error handling interaction:', err);
    }
  }

  /**
   * Helper to acknowledge interactions (Legacy/Raw)
   */
  async acknowledge(interactionId: string, token: string, type: number = 6) {
    try {
      await this.client.rest.request('POST', `/interactions/${interactionId}/${token}/callback`, {
        type: type
      });
    } catch (err) {
      Logger.error(`Failed to acknowledge interaction ${interactionId}`, err);
    }
  }

  /**
   * Sync Slash Commands with Discord
   */
  async syncCommands(commands: any[]) {
    Logger.info(`Syncing ${commands.length} slash commands...`);
    try {
      const app = await this.client.rest.users.getMe();
      await this.client.rest.commands.createGlobalCommand(app.id, commands);
      Logger.info('Slash commands synced successfully.');
    } catch (err) {
      Logger.error('Failed to sync slash commands:', err);
    }
  }
}
