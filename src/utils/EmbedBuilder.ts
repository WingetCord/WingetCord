export interface EmbedData {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: { text: string; icon_url?: string };
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; url?: string; icon_url?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
}

export class EmbedBuilder {
  private data: EmbedData = { fields: [] };

  constructor(data?: EmbedData) {
    if (data) this.data = { ...this.data, ...data };
  }

  setTitle(title: string) {
    this.data.title = title;
    return this;
  }

  setDescription(description: string) {
    this.data.description = description;
    return this;
  }

  setColor(color: number | string) {
    if (typeof color === 'string') {
      this.data.color = parseInt(color.replace('#', ''), 16);
    } else {
      this.data.color = color;
    }
    return this;
  }

  addField(name: string, value: string, inline?: boolean) {
    const field: { name: string; value: string; inline?: boolean } = { name, value };
    if (inline !== undefined) field.inline = inline;
    this.data.fields?.push(field);
    return this;
  }

  setTimestamp(timestamp: Date | number = new Date()) {
    this.data.timestamp = new Date(timestamp).toISOString();
    return this;
  }

  setFooter(text: string, iconUrl?: string) {
    this.data.footer = { text };
    if (iconUrl !== undefined) this.data.footer.icon_url = iconUrl;
    return this;
  }

  toJSON() {
    return { ...this.data };
  }
}
