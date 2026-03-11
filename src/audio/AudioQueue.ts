import { Track, TrackData } from './Track.js';

export type RepeatMode = 'none' | 'track' | 'queue';

export interface AudioQueueOptions {
  voiceChannelId: string;
  textChannelId: string;
}

export class AudioQueue {
  readonly voiceChannelId: string;
  readonly textChannelId: string;
  private tracks: Track[] = [];
  private currentTrack: Track | null = null;
  private volume = 100;
  private repeatMode: RepeatMode = 'none';
  private shuffling = false;
  private paused = false;

  constructor(options: AudioQueueOptions) {
    this.voiceChannelId = options.voiceChannelId;
    this.textChannelId = options.textChannelId;
  }

  addTrack(data: TrackData): Track {
    const track = new Track(data);
    this.tracks.push(track);
    return track;
  }

  addTracks(data: TrackData[]): Track[] {
    const added: Track[] = [];
    for (const trackData of data) {
      added.push(this.addTrack(trackData));
    }
    return added;
  }

  removeTrack(trackId: string): Track | undefined {
    const index = this.tracks.findIndex(t => t.id === trackId);
    if (index === -1) return undefined;
    return this.tracks.splice(index, 1)[0];
  }

  getTrack(trackId: string): Track | undefined {
    return this.tracks.find(t => t.id === trackId);
  }

  clear(): void {
    this.tracks = [];
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  setRepeatMode(mode: RepeatMode): void {
    this.repeatMode = mode;
  }

  getRepeatMode(): RepeatMode {
    return this.repeatMode;
  }

  shuffle(): void {
    if (this.shuffling) return;
    this.shuffling = true;
    
    // Fisher-Yates shuffle - use temp variable
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.tracks[i];
      const other = this.tracks[j];
      if (temp !== undefined && other !== undefined) {
        this.tracks[i] = other;
        this.tracks[j] = temp;
      }
    }
    this.shuffling = false;
  }

  isShuffling(): boolean {
    return this.shuffling;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  setCurrentTrack(track: Track | null): void {
    this.currentTrack = track;
  }

  getNextTrack(): Track | undefined {
    if (this.repeatMode === 'track' && this.currentTrack) {
      return this.currentTrack;
    }
    return this.tracks[0];
  }

  getTracks(): Track[] {
    return [...this.tracks];
  }

  getTrackCount(): number {
    return this.tracks.length;
  }

  isEmpty(): boolean {
    return this.tracks.length === 0 && this.currentTrack === null;
  }

  get totalDuration(): number {
    return this.tracks.reduce((sum, track) => sum + track.duration, 0);
  }

  get totalDurationFormatted(): string {
    const total = this.totalDuration;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
