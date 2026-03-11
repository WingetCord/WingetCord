/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LoggerOptions {
  name?: string;
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export class Logger {
  private name: string;
  private level: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.name = options.name ?? 'wingetcord';
    this.level = options.level ?? 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const prefix = `[${this.name}]`;
    const msg = `${prefix} ${message}`;

    switch (level) {
      case 'trace':
      case 'debug':
        console.debug(msg, ...args);
        break;
      case 'info':
        console.info(msg, ...args);
        break;
      case 'warn':
        console.warn(msg, ...args);
        break;
      case 'error':
      case 'fatal':
        console.error(msg, ...args);
        break;
    }
  }

  trace(message: string, ...args: any[]): void {
    this.log('trace', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  fatal(message: string, ...args: any[]): void {
    this.log('fatal', message, ...args);
  }

  child(bindings: Record<string, unknown>): Logger {
    const bindingName = typeof bindings['name'] === 'string' ? bindings['name'] : 'child';
    const newLogger = new Logger({ name: `${this.name}:${bindingName}` });
    return newLogger;
  }
}

export const logger = new Logger();
