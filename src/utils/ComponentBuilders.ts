import { ButtonStyle, ComponentType } from './Enums.js';

export class ButtonBuilder {
  private data: any = { type: ComponentType.Button };
  private actionCallback: ((interaction: any) => any) | null = null;

  setCustomId(id: string) {
    this.data.custom_id = id;
    return this;
  }

  onAction(callback: (interaction: any) => any) {
    this.actionCallback = callback;
    if (!this.data.custom_id) {
      this.data.custom_id = `wc_${Math.random().toString(36).slice(2, 11)}`;
    }
    return this;
  }

  setLabel(label: string) {
    this.data.label = label;
    return this;
  }

  setStyle(style: ButtonStyle) {
    this.data.style = style;
    return this;
  }

  setEmoji(emoji: { name?: string; id?: string; animated?: boolean }) {
    this.data.emoji = emoji;
    return this;
  }

  setURL(url: string) {
    this.data.url = url;
    this.data.style = ButtonStyle.Link;
    return this;
  }

  setDisabled(disabled: boolean = true) {
    this.data.disabled = disabled;
    return this;
  }

  toJSON() {
    return { ...this.data, _action: this.actionCallback };
  }
}

export class SelectMenuBuilder {
  private data: any;
  private actionCallback: ((interaction: any) => any) | null = null;

  constructor(type: ComponentType = ComponentType.StringSelect) {
    this.data = { type, options: [] };
  }

  setCustomId(id: string) {
    this.data.custom_id = id;
    return this;
  }

  onAction(callback: (interaction: any) => any) {
    this.actionCallback = callback;
    if (!this.data.custom_id) {
      this.data.custom_id = `wc_${Math.random().toString(36).slice(2, 11)}`;
    }
    return this;
  }

  setPlaceholder(placeholder: string) {
    this.data.placeholder = placeholder;
    return this;
  }

  setMinValues(min: number) {
    this.data.min_values = min;
    return this;
  }

  setMaxValues(max: number) {
    this.data.max_values = max;
    return this;
  }

  setDisabled(disabled: boolean = true) {
    this.data.disabled = disabled;
    return this;
  }

  addOptions(...options: { label: string; value: string; description?: string; emoji?: any; default?: boolean }[]) {
    this.data.options.push(...options);
    return this;
  }

  setChannelTypes(types: number[]) {
    this.data.channel_types = types;
    return this;
  }

  toJSON() {
    const json = { ...this.data, _action: this.actionCallback };
    if (json.type !== ComponentType.StringSelect) delete json.options;
    return json;
  }
}

export class ActionRowBuilder {
  private components: any[] = [];

  addComponents(...components: (ButtonBuilder | SelectMenuBuilder | any)[]) {
    this.components.push(...components.map(c => c.toJSON?.() || c));
    return this;
  }

  toJSON() {
    return {
      type: ComponentType.ActionRow,
      components: this.components
    };
  }
}
