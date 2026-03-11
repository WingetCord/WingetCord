/**
 * Advanced Audio Player System
 *
 * Features:
 * - Multi-channel audio queue
 * - Multiple source support
 * - Audio filters
 * - Volume control
 * - Repeat modes
 */

import { EventEmitter } from 'events';

export type AudioSourceType = 'youtube' | 'soundcloud' | 'http' | 'local' | 'discord';
export type RepeatMode = 'off' | 'track' | 'queue';
export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'stopped' | 'buffering';

export interface AudioTrack {
  id: string;
  source: AudioSourceType;
  url: string;
  title: string;
  author?: string;
  duration: number;
  thumbnail?: string;
  requestedBy: string;
  playlistId?: string;
}

export interface AudioFilters {
  bassboost?: number;
  volume?: number;
  speed?: number;
}

export interface AudioQueueOptions {
  maxSize?: number;
  voiceChannelId: string;
  textChannelId: string;
  autoPlay?: boolean;
}

export interface AudioPlayerOptions {
  maxQueues?: number;
  defaultVolume?: number;
}

export interface QueueHistoryEntry {
  track: AudioTrack;
  timestamp: Date;
}

/**
 * Audio Queue for a single voice channel
 */
export class AudioQueue extends EventEmitter {
  public readonly voiceChannelId: string;
  public readonly textChannelId: string;

  private tracks: AudioTrack[] = [];
  private currentTrack: AudioTrack | null = null;
  private position: number = 0;
  private volume: number = 100;
  private repeatMode: RepeatMode = 'off';
  private shuffle: boolean = false;
  private filters: AudioFilters = {};
  private status: PlayerStatus = 'idle';
  private _autoPlay: boolean;
  private maxSize: number;
  private pausedAt: number = 0;

  constructor(options: AudioQueueOptions) {
    super();
    this.voiceChannelId = options.voiceChannelId;
    this.textChannelId = options.textChannelId;
    this._autoPlay = options.autoPlay ?? true;
    this.maxSize = options.maxSize || 1000;
  }

  addTrack(track: AudioTrack, position?: number): void {
    if (this.tracks.length >= this.maxSize) {
      throw new Error('Queue is full');
    }

    if (position !== undefined && position >= 0 && position <= this.tracks.length) {
      this.tracks.splice(position, 0, track);
    } else {
      this.tracks.push(track);
    }

    this.emit('trackAdd', track, this);
  }

  addTracks(tracks: AudioTrack[]): void {
    for (const track of tracks) {
      this.addTrack(track);
    }
  }

  removeTrack(index: number): AudioTrack | null {
    if (index < 0 || index >= this.tracks.length) return null;
    return this.tracks.splice(index, 1)[0] ?? null;
  }

  removeTrackById(id: string): AudioTrack | null {
    const index = this.tracks.findIndex((t: AudioTrack) => t.id === id);
    return this.removeTrack(index);
  }

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack ?? null;
  }

  getTracks(): AudioTrack[] {
    return [...this.tracks];
  }

  getTrack(index: number): AudioTrack | null {
    return this.tracks[index] ?? null;
  }

  get length(): number {
    return this.tracks.length;
  }

  get totalDuration(): number {
    let duration = this.currentTrack ? this.currentTrack.duration - this.position : 0;
    for (const track of this.tracks) {
      if (track) duration += track.duration;
    }
    return duration;
  }

  clear(): void {
    this.tracks = [];
    this.emit('queueClear', this);
  }

  shuffleQueue(): void {
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.tracks[i];
      const temp2 = this.tracks[j];
      if (temp && temp2) {
        this.tracks[i] = temp2;
        this.tracks[j] = temp;
      }
    }
    this.shuffle = true;
    this.emit('queueShuffle', this);
  }

  setRepeatMode(mode: RepeatMode): void {
    this.repeatMode = mode;
    this.emit('repeatModeChange', mode, this);
  }

  getRepeatMode(): RepeatMode {
    return this.repeatMode;
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(200, vol));
    this.emit('volumeChange', this.volume, this);
  }

  getVolume(): number {
    return this.volume;
  }

  setFilters(filters: AudioFilters): void {
    this.filters = { ...this.filters, ...filters };
    this.emit('filtersChange', this.filters, this);
  }

  getFilters(): AudioFilters {
    return { ...this.filters };
  }

  clearFilters(): void {
    this.filters = {};
    this.emit('filtersChange', this.filters, this);
  }

  setPosition(pos: number): void {
    if (this.currentTrack) {
      this.position = Math.max(0, Math.min(this.currentTrack.duration, pos));
    }
  }

  getPosition(): number {
    return this.position;
  }

  setStatus(st: PlayerStatus): void {
    this.status = st;
    this.emit('statusChange', st, this);
  }

  getStatus(): PlayerStatus {
    return this.status;
  }

  setCurrentTrack(track: AudioTrack | null): void {
    this.currentTrack = track ?? null;
    this.position = 0;
    this.emit('currentTrackChange', track, this);
  }

  skipTo(index: number): AudioTrack | null {
    if (index < 0 || index >= this.tracks.length) return null;
    const track = this.tracks[index];
    if (track) {
      this.tracks.splice(index, 1);
      this.currentTrack = track;
      this.position = 0;
    }
    return track ?? null;
  }

  pause(): void {
    if (this.status === 'playing') {
      this.pausedAt = this.position;
      this.setStatus('paused');
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.position = this.pausedAt;
      this.setStatus('playing');
    }
  }

  stop(): void {
    this.currentTrack = null;
    this.position = 0;
    this.tracks = [];
    this.setStatus('stopped');
  }

  peek(): AudioTrack | null {
    return this.tracks[0] ?? null;
  }

  next(): AudioTrack | null {
    if (this.repeatMode === 'track' && this.currentTrack) {
      return this.currentTrack;
    }

    let track: AudioTrack | null = null;

    if (this.tracks.length > 0) {
      if (this.shuffle && this.repeatMode !== 'track') {
        const index = Math.floor(Math.random() * this.tracks.length);
        track = this.tracks[index] ?? null;
        if (track) this.tracks.splice(index, 1);
      } else {
        track = this.tracks.shift() ?? null;
      }
    }

    if (track) {
      this.setCurrentTrack(track);
    }

    return track;
  }

  getInfo() {
    return {
      voiceChannelId: this.voiceChannelId,
      textChannelId: this.textChannelId,
      currentTrack: this.currentTrack,
      tracks: this.tracks,
      length: this.length,
      volume: this.volume,
      repeatMode: this.repeatMode,
      status: this.status,
    };
  }
}

/**
 * Multi-channel Audio Player Manager
 */
export class AudioPlayer extends EventEmitter {
  private queues: Map<string, AudioQueue> = new Map();
  private history: Map<string, QueueHistoryEntry[]> = new Map();

  private readonly maxQueues: number;
  private readonly defaultVolume: number;
  private readonly _maxHistorySize: number = 100;

  constructor(options: AudioPlayerOptions = {}) {
    super();
    this.maxQueues = options.maxQueues || 10;
    this.defaultVolume = options.defaultVolume ?? 100;
  }

  getOrCreateQueue(options: AudioQueueOptions): AudioQueue {
    let queue = this.queues.get(options.voiceChannelId);

    if (!queue) {
      if (this.queues.size >= this.maxQueues) {
        throw new Error('Maximum number of queues reached');
      }

      queue = new AudioQueue(options);
      this.queues.set(options.voiceChannelId, queue);
      this.emit('queueCreate', queue, this);
    }

    return queue;
  }

  getQueue(voiceChannelId: string): AudioQueue | undefined {
    return this.queues.get(voiceChannelId);
  }

  deleteQueue(voiceChannelId: string): boolean {
    const queue = this.queues.get(voiceChannelId);
    if (queue) {
      queue.stop();
      this.queues.delete(voiceChannelId);
      this.history.delete(voiceChannelId);
      return true;
    }
    return false;
  }

  getAllQueues(): AudioQueue[] {
    return Array.from(this.queues.values());
  }

  get queueCount(): number {
    return this.queues.size;
  }

  addTrack(voiceChannelId: string, track: AudioTrack, position?: number): void {
    const queue = this.queues.get(voiceChannelId);
    if (!queue) {
      throw new Error(`No queue exists for voice channel: ${voiceChannelId}`);
    }
    queue.addTrack(track, position);
  }

  async playNext(voiceChannelId: string): Promise<AudioTrack | null> {
    const queue = this.queues.get(voiceChannelId);
    if (!queue) return null;

    const track = queue.next();
    if (track) {
      queue.setStatus('playing');
      this.emit('play', track, queue, this);
    } else {
      queue.setStatus('idle');
    }

    return track ?? null;
  }

  pause(voiceChannelId: string): void {
    const queue = this.queues.get(voiceChannelId);
    if (queue) queue.pause();
  }

  resume(voiceChannelId: string): void {
    const queue = this.queues.get(voiceChannelId);
    if (queue) queue.resume();
  }

  stop(voiceChannelId: string): void {
    const queue = this.queues.get(voiceChannelId);
    if (queue) queue.stop();
  }

  skip(voiceChannelId: string, count: number = 1): void {
    const queue = this.queues.get(voiceChannelId);
    if (!queue) return;

    for (let i = 1; i < count; i++) {
      queue.next();
    }

    this.playNext(voiceChannelId);
  }

  setVolume(voiceChannelId: string, vol: number): void {
    const queue = this.queues.get(voiceChannelId);
    if (queue) queue.setVolume(vol);
  }

  getVolume(voiceChannelId: string): number {
    const queue = this.queues.get(voiceChannelId);
    return queue ? queue.getVolume() : this.defaultVolume;
  }

  setRepeatMode(voiceChannelId: string, mode: RepeatMode): void {
    const queue = this.queues.get(voiceChannelId);
    if (queue) queue.setRepeatMode(mode);
  }

  shuffle(voiceChannelId: string): void {
    const queue = this.queues.get(voiceChannelId);
    if (queue) queue.shuffleQueue();
  }

  clear(voiceChannelId: string): void {
    const queue = this.queues.get(voiceChannelId);
    if (queue) queue.clear();
  }

  getHistory(voiceChannelId: string): QueueHistoryEntry[] {
    return this.history.get(voiceChannelId) || [];
  }

  destroy(): void {
    for (const queue of this.queues.values()) {
      queue.stop();
    }
    this.queues.clear();
    this.history.clear();
  }
}

export default AudioPlayer;
