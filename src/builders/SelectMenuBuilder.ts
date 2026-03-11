export class SelectMenuBuilder {
  private data = { type: 3, custom_id: '', options: [] as { label: string; value: string }[] };

  setCustomId(id: string): this {
    this.data.custom_id = id;
    return this;
  }

  addOption(label: string, value: string): this {
    this.data.options.push({ label, value });
    return this;
  }

  toJSON(): unknown {
    return this.data;
  }
}
