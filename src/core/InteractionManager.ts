import { EventEmitter } from 'events';
import type { Client } from './Client.js';
import { Collector } from '../utils/Collector.js';
import type { CollectorOptions } from '../utils/Collector.js';
import { Logger } from './Logger.js';

/**
 * InteractionManager: Handles Slash Commands and MESSAGE_COMPONENT interactions.
 * optimized for fast acknowledgement and robust cleanup.
 */
export class InteractionManager extends EventEmitter {
  private collectors: Set<Collector<any>> = new Set();

  constructor(private client: Client) {
    super();
    this.client.on('INTERACTION_CREATE', (interaction: any) => this.handleInteraction(interaction));
  }

  /**
   * Creates a dedicated collector for interactions.
   * Ensures automated cleanup to prevent memory leaks.
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

  private async handleInteraction(interaction: any) {
    try {
      // 1. Check Collectors first
      for (const collector of this.collectors) {
        // Use custom_id or message_id as identifier
        const id = interaction.data?.custom_id || interaction.id;
        if (collector.handle(interaction, id)) return;
      }

      // 2. Fast Acknowledge logic if needed (handled by handlers usually)
      
      // 3. Handle Slash Commands
      if (interaction.type === 2) { // APPLICATION_COMMAND
        this.emit('command', interaction);
      }

      // 4. Handle Components (Buttons, Menus)
      if (interaction.type === 3) { // MESSAGE_COMPONENT
        this.emit('component', interaction);
      }
    } catch (err) {
      Logger.error('Error handling interaction:', err);
      // Try to send an error response if possible
      this.sendErrorResponse(interaction, 'An internal error occurred while processing this interaction.');
    }
  }

  private async sendErrorResponse(interaction: any, message: string) {
    try {
      await this.client.rest.request('POST', `/interactions/${interaction.id}/${interaction.token}/callback`, {
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: message,
          flags: 64 // EPHEMERAL
        }
      });
    } catch (e) {
      // Ignore if already acknowledged
    }
  }

  /**
   * Helper to acknowledge interactions quickly (< 3s)
   */
  async acknowledge(interaction: any, type: number = 6) {
    try {
      await this.client.rest.request('POST', `/interactions/${interaction.id}/${interaction.token}/callback`, {
        type: type
      });
    } catch (err) {
      Logger.error(`Failed to acknowledge interaction ${interaction.id}`, err);
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
