export interface TrackData {
  id: string;
  source: 'youtube' | 'soundcloud' | 'http' | 'local' | 'spotify';
  url: string;
  title: string;
  description?: string;
  duration: number;
  thumbnail?: string;
  author?: string;
  requestedBy: string;
  playlistId?: string;
  position?: number;
}

export class Track {
  readonly id: string;
  readonly source: string;
  readonly url: string;
  readonly title: string;
  readonly description: string | undefined;
  readonly duration: number;
  readonly thumbnail: string | undefined;
  readonly author: string | undefined;
  readonly requestedBy: string;
  readonly playlistId: string | undefined;
  readonly position: number | undefined;
  readonly addedAt: Date;

  constructor(data: TrackData) {
    this.id = data.id;
    this.source = data.source;
    this.url = data.url;
    this.title = data.title;
    this.description = data.description;
    this.duration = data.duration;
    this.thumbnail = data.thumbnail;
    this.author = data.author;
    this.requestedBy = data.requestedBy;
    this.playlistId = data.playlistId;
    this.position = data.position;
    this.addedAt = new Date();
  }

  get durationFormatted(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get isStream(): boolean {
    return this.duration === 0;
  }
}
