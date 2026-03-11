import type { ComponentInteraction } from './ComponentInteraction.js';

type InteractionHandler = (interaction: ComponentInteraction) => Promise<void>;

export class InlineCallbackRegistry {
  private callbacks = new Map<string, InteractionHandler>();
  private counter = 0;

  register(customId: string, handler: InteractionHandler): void {
    this.callbacks.set(customId, handler);
  }

  generateId(): string {
    return `__wc_inline_${++this.counter}_${Date.now()}`;
  }

  has(customId: string): boolean {
    return this.callbacks.has(customId);
  }

  async invoke(customId: string, interaction: ComponentInteraction): Promise<void> {
    const handler = this.callbacks.get(customId);
    if (handler) await handler(interaction);
  }

  unregister(customId: string): void {
    this.callbacks.delete(customId);
  }
}

export const inlineCallbackRegistry = new InlineCallbackRegistry();
