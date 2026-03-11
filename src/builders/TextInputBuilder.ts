export class TextInputBuilder {
  private data = { type: 4, custom_id: '', style: 1, label: '' };

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

  setPlaceholder(placeholder: string): void {
    (this.data as { placeholder?: string }).placeholder = placeholder;
  }

  toJSON(): unknown {
    return this.data;
  }
}
