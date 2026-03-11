/**
 * Interaction Manager
 */
import { EventEmitter } from 'events';

export class InteractionManager extends EventEmitter {
  constructor() {
    super();
  }

  handleInteraction(data: unknown): void {
    this.emit('interactionCreate', data);
  }
}

export interface Interaction {
  id: string;
  type: number;
  data?: unknown;
}

export interface CommandInteraction extends Interaction {
  type: 2;
  options?: unknown;
}

export interface ComponentInteraction extends Interaction {
  type: 3;
  customId?: string;
}

export interface AutocompleteInteraction extends Interaction {
  type: 4;
  options?: unknown;
}

export interface ModalSubmitInteraction extends Interaction {
  type: 5;
  customId?: string;
}
