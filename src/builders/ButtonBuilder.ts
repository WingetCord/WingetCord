export class ButtonBuilder {
  private data = { type: 2, style: 1, custom_id: '', label: '' };

  setCustomId(id: string): this {
    this.data.custom_id = id;
    return this;
  }

  setLabel(label: string): this {
    this.data.label = label;
    return this;
  }

  setStyle(style: number): this {
    this.data.style = style;
    return this;
  }

  setURL(url: string): this {
    this.data.style = 5;
    (this.data as { url?: string }).url = url;
    return this;
  }

  toJSON(): unknown {
    return this.data;
  }
}
