import { EventEmitter } from 'events';
import type { Client } from './Client.js';
import { Collector } from '../utils/Collector.js';
import type { CollectorOptions } from '../utils/Collector.js';
import { Logger } from './Logger.js';
import {
  Interaction,
  CommandInteraction,
  ComponentInteraction,
  AutocompleteInteraction,
  ModalSubmitInteraction,
} from '../structures/Interaction.js';
import { InteractionType } from '../utils/Enums.js';

export class InteractionManager extends EventEmitter {
  private collectors = new Set<Collector<unknown>>();
  private actionRegistry = new Map<string, (interaction: unknown) => unknown>();

  constructor(private client: Client) {
    super();
    this.client.on('INTERACTION_CREATE', (payload: unknown) => this.handleInteraction(payload));

    this.client.on('raw', (event: string, data: unknown) => {
      if (event === 'MESSAGE_CREATE' || event === 'INTERACTION_CREATE') {
        const d = data as { components?: unknown[]; data?: { components?: unknown[] } };
        const comps = d.components || d.data?.components;
        if (comps) this.scanForActions(comps);
      }
    });
  }

  private scanForActions(components: unknown[]) {
    if (!components) return;
    for (const row of components as {
      type: number;
      components: { _action?: unknown; custom_id?: string }[];
    }[]) {
      if (row.type !== 1) continue;
      for (const comp of row.components) {
        if (comp._action && comp.custom_id) {
          this.registerAction(comp.custom_id, comp._action as (interaction: unknown) => unknown);
        }
      }
    }
  }

  createCollector<T>(options: CollectorOptions<T>): Collector<T> {
    const collector = new Collector<T>(options);
    this.collectors.add(collector as Collector<unknown>);

    collector.once('end', () => {
      this.collectors.delete(collector as Collector<unknown>);
      collector.removeAllListeners();
    });

    return collector;
  }

  private async handleInteraction(payload: unknown) {
    try {
      const p = payload as {
        type: number;
        id: string;
        data?: { custom_id?: string };
      };
      let interaction: Interaction;

      if (p.type === InteractionType.ApplicationCommand) {
        interaction = new CommandInteraction(this.client, p);
      } else if (p.type === InteractionType.MessageComponent) {
        interaction = new ComponentInteraction(this.client, p);
      } else if (p.type === InteractionType.ApplicationCommandAutocomplete) {
        interaction = new AutocompleteInteraction(this.client, p);
      } else if (p.type === InteractionType.ModalSubmit) {
        interaction = new ModalSubmitInteraction(this.client, p);
      } else {
        interaction = new Interaction(this.client, p);
      }

      for (const collector of this.collectors) {
        const id = p.data?.custom_id || p.id;
        if (collector.handle(interaction, id)) return;
      }

      if (interaction instanceof ComponentInteraction) {
        const callback = this.actionRegistry.get(interaction.customId);
        if (callback) {
          await callback(interaction);
          return;
        }
      }

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

  async acknowledge(interactionId: string, token: string, type = 6) {
    try {
      await this.client.rest.request('POST', `/interactions/${interactionId}/${token}/callback`, {
        type,
      });
    } catch (err) {
      Logger.error(`Failed to acknowledge interaction ${interactionId}`, err);
    }
  }

  async syncCommands(commands: unknown[]) {
    Logger.info(`Syncing ${commands.length} slash commands...`);
    try {
      const app = (await this.client.rest.users.getMe()) as { id: string };
      await this.client.rest.commands.createGlobalCommand(app.id, commands);
      Logger.info('Slash commands synced successfully.');
    } catch (err) {
      Logger.error('Failed to sync slash commands:', err);
    }
  }

  registerAction(customId: string, callback: (interaction: unknown) => unknown, timeout = 300000) {
    this.actionRegistry.set(customId, callback);
    setTimeout(() => {
      this.actionRegistry.delete(customId);
    }, timeout);
  }
}
