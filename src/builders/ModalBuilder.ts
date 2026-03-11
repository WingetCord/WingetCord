export class ModalBuilder {
  private data = { type: 9, custom_id: '', title: '', components: [] as unknown[] };

  setCustomId(id: string): this {
    this.data.custom_id = id;
    return this;
  }

  setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  addComponent(component: unknown): this {
    this.data.components.push(component);
    return this;
  }

  toJSON(): unknown {
    return this.data;
  }
}
