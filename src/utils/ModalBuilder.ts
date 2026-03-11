import { ComponentType, TextInputStyle } from '../utils/Enums.js';

export class TextInputBuilder {
  private data: any = {
    type: ComponentType.TextInput,
  };

  setCustomId(customId: string) {
    this.data.custom_id = customId;
    return this;
  }

  setLabel(label: string) {
    this.data.label = label;
    return this;
  }

  setStyle(style: TextInputStyle) {
    this.data.style = style;
    return this;
  }

  setPlaceholder(placeholder: string) {
    this.data.placeholder = placeholder;
    return this;
  }

  setValue(value: string) {
    this.data.value = value;
    return this;
  }

  setMinLength(min: number) {
    this.data.min_length = min;
    return this;
  }

  setMaxLength(max: number) {
    this.data.max_length = max;
    return this;
  }

  setRequired(required: boolean = true) {
    this.data.required = required;
    return this;
  }

  toJSON() {
    return this.data;
  }
}

export class ModalBuilder {
  private data: any = {
    title: '',
    custom_id: '',
    components: [],
  };

  setTitle(title: string) {
    this.data.title = title;
    return this;
  }

  setCustomId(customId: string) {
    this.data.custom_id = customId;
    return this;
  }

  addComponents(...components: any[]) {
    for (const component of components) {
      if (Array.isArray(component)) {
        this.data.components.push({
          type: ComponentType.ActionRow,
          components: component.map(c => c.toJSON?.() || c),
        });
      } else if (component.toJSON?.().type === ComponentType.ActionRow) {
        this.data.components.push(component.toJSON());
      } else {
        this.data.components.push({
          type: ComponentType.ActionRow,
          components: [component.toJSON?.() || component],
        });
      }
    }
    return this;
  }

  toJSON() {
    return this.data;
  }
}
