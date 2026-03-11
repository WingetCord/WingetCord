import { BaseStructure } from './Base.js';
import type { Client } from '../client/Client.js';

export interface AttachmentPayload {
  id: string;
  filename: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
  description?: string;
}

export class Attachment extends BaseStructure {
  readonly id: string;
  readonly filename: string;
  readonly contentType: string | undefined;
  readonly size: number;
  readonly url: string;
  readonly proxyUrl: string;
  readonly height: number | undefined;
  readonly width: number | undefined;
  readonly ephemeral: boolean;
  readonly description: string | undefined;

  constructor(client: Client, data: AttachmentPayload) {
    super(client);
    this.id = data.id;
    this.filename = data.filename;
    this.contentType = data.content_type;
    this.size = data.size;
    this.url = data.url;
    this.proxyUrl = data.proxy_url;
    this.height = data.height;
    this.width = data.width;
    this.ephemeral = data.ephemeral ?? false;
    this.description = data.description;
  }

  get isImage(): boolean {
    if (!this.contentType) return false;
    return this.contentType.startsWith('image/');
  }

  get isVideo(): boolean {
    if (!this.contentType) return false;
    return this.contentType.startsWith('video/');
  }

  get isAudio(): boolean {
    if (!this.contentType) return false;
    return this.contentType.startsWith('audio/');
  }

  get isApplication(): boolean {
    if (!this.contentType) return false;
    return this.contentType.startsWith('application/');
  }

  get sizeInMB(): number {
    return this.size / (1024 * 1024);
  }

  get aspectRatio(): number | undefined {
    if (this.height === undefined || this.width === undefined) {
      return undefined;
    }
    return this.width / this.height;
  }
}
