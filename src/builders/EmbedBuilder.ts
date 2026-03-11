/**
 * Embed Builder
 */
export class EmbedBuilder {
  private data: {
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
  } = {};

  setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  setColor(color: number): this {
    this.data.color = color;
    return this;
  }

  addField(name: string, value: string, inline = false): this {
    this.data.fields = this.data.fields || [];
    this.data.fields.push({ name, value, inline });
    return this;
  }

  toJSON(): unknown {
    return this.data;
  }
}
