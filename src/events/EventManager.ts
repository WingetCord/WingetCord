/**
 * Event Manager
 */
import { EventEmitter } from 'events';

export class EventManager extends EventEmitter {}

export interface Event {
  name: string;
  handler: (...args: unknown[]) => void;
  once?: boolean;
}
