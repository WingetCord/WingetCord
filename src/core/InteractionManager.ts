import { EventEmitter } from 'events';
import type { Client } from './Client.js';
import { Collector } from '../utils/Collector.js';
import type { CollectorOptions } from '../utils/Collector.js';
import { Logger } from './Logger.js';
import { Interaction, CommandInteraction, ComponentInteraction, AutocompleteInteraction, ModalSubmitInteraction } from '../structures/Interaction.js';
import { InteractionType } from '../utils/Enums.js';

/**
 * InteractionManager: Handles Slash Commands and MESSAGE_COMPONENT interactions.
 */
export class InteractionManager extends EventEmitter {
  private collectors: Set<Collector<any>> = new Set();
  private actionRegistry: Map<string, (interaction: any) => any> = new Map();

  constructor(private client: Client) {
    super();
    this.client.on('INTERACTION_CREATE', (payload: any) => this.handleInteraction(payload));
    
    // Intercept outbound messages to register inline actions
    this.client.on('raw', (event, data) => {
      if (event === 'MESSAGE_CREATE' || event === 'INTERACTION_CREATE') {
        this.scanForActions(data.components || data.data?.components);
      }
    });
  }

  private scanForActions(components: any[]) {
    if (!components) return;
    for (const row of components) {
      if (row.type !== 1) continue; // ActionRow
      for (const comp of row.components) {
        if (comp._action && comp.custom_id) {
          this.registerAction(comp.custom_id, comp._action);
        }
      }
    }
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

      if (payload.type === InteractionType.ApplicationCommand) {
        interaction = new CommandInteraction(this.client, payload);
      } else if (payload.type === InteractionType.MessageComponent) {
        interaction = new ComponentInteraction(this.client, payload);
      } else if (payload.type === InteractionType.ApplicationCommandAutocomplete) {
        interaction = new AutocompleteInteraction(this.client, payload);
      } else if (payload.type === InteractionType.ModalSubmit) {
        interaction = new ModalSubmitInteraction(this.client, payload);
      } else {
        interaction = new Interaction(this.client, payload);
      }

      // 1. Check Collectors first
      for (const collector of this.collectors) {
        const id = payload.data?.custom_id || payload.id;
        if (collector.handle(interaction, id)) return;
      }

      // 1.5 Check Action Registry (Inline Callbacks)
      if (interaction instanceof ComponentInteraction) {
        const callback = this.actionRegistry.get(interaction.customId);
        if (callback) {
          await callback(interaction);
          return;
        }
      }

      // 2. Handle Events
      if (interaction instanceof CommandInteraction) {
        this.emit('command', interaction);
      } else if (interaction instanceof ComponentInteraction) {
        this.emit('component', interaction);
      } else if (interaction instanceof AutocompleteInteraction) {
        this.emit('autocomplete', interaction);
      } else if (interaction instanceof ModalSubmitInteraction) {
        this.emit('modal', interaction);
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

  /**
   * Register an inline callback for a component.
   */
  registerAction(customId: string, callback: (interaction: any) => any, timeout: number = 300000) {
    this.actionRegistry.set(customId, callback);
    // Auto-cleanup after 5 minutes by default
    setTimeout(() => {
      this.actionRegistry.delete(customId);
    }, timeout);
  }
}
