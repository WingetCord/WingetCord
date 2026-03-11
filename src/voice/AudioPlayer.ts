import { EventEmitter } from 'events';
import { Logger } from '../core/Logger.js';

export interface AudioTrack {
  url: string;
  title: string;
  duration?: number;
  requester?: string;
}

/**
 * AudioPlayer: Modular and resilient audio queue.
 * Handles atomic controls and track error isolation.
 */
export class AudioPlayer extends EventEmitter {
  public queue: AudioTrack[] = [];
  public isPlaying: boolean = false;
  private currentTrack: AudioTrack | null = null;
  public volume: number = 1.0;

  constructor() {
    super();
  }

  /**
   * Play a track or add it to the queue.
   */
  play(track: AudioTrack) {
    this.queue.push(track);
    if (!this.isPlaying) this.processQueue();
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.currentTrack = null;
      this.emit('idle');
      return;
    }

    this.isPlaying = true;
    this.currentTrack = this.queue.shift()!;
    this.emit('start', this.currentTrack);

    Logger.info(`Playing track: ${this.currentTrack.title}`);

    try {
      // Placeholder for actual RTP/Opus streaming logic
      // In a real implementation, we'd wait for the stream to end
      // await this.streamTrack(this.currentTrack);
    } catch (err) {
      Logger.error(`Track failed: ${this.currentTrack.title}`, err);
      this.emit('error', err, this.currentTrack);
    } finally {
      // Ensure we always attempt the next track even if this one fails
      this.processQueue();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(2.0, volume));
    this.emit('volumeChange', this.volume);
  }

  skip() {
    this.emit('skip', this.currentTrack);
    this.processQueue();
  }

  pause() {
    this.isPlaying = false;
    this.emit('pause');
  }

  resume() {
    this.isPlaying = true;
    this.emit('resume');
  }

  stop() {
    this.queue = [];
    this.isPlaying = false;
    this.currentTrack = null;
    this.emit('stop');
  }

  get current() {
    return this.currentTrack;
  }
}
