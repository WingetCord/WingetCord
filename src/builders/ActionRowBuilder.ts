export class ActionRowBuilder {
  private components: unknown[] = [];

  addComponent(component: unknown): this {
    this.components.push(component);
    return this;
  }

  toJSON(): unknown {
    return { type: 1, components: this.components };
  }
}
