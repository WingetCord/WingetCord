/**
 * Professional Logging System
 * Structured JSON logging with correlation IDs
 */

import pino from 'pino';

/**
 * Log levels
 */
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Logger options
 */
export interface LoggerOptions {
  /** Log level */
  level?: LogLevel;
  /** Enable pretty printing */
  pretty?: boolean;
  /** Service name for logging */
  service?: string;
  /** Custom transports */
  transports?: pino.TransportSingleOptions[];
}

/**
 * Log context
 */
export interface LogContext {
  /** Correlation ID for request tracing */
  correlationId?: string;
  /** User ID if available */
  userId?: string;
  /** Guild ID if available */
  guildId?: string;
  /** Command name */
  command?: string;
  /** Event name */
  event?: string;
  /** Custom metadata */
  [key: string]: unknown;
}

/**
 * Enhanced Logger with context and structured logging
 */
export class Logger {
  private logger: pino.Logger;
  private service: string;
  private context: LogContext = {};

  constructor(options: LoggerOptions = {}) {
    this.service = options.service || 'wingetcord';
    
    const config: pino.LoggerOptions = {
      level: options.level || LogLevel.INFO,
      name: this.service,
      formatters: {
        level: (label) => ({ level: label }),
      },
    };

    if (options.pretty) {
      config.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      };
    }

    this.logger = pino(config);
  }

  /**
   * Set correlation ID for context
   */
  setCorrelationId(id: string): this {
    this.context.correlationId = id;
    return this;
  }

  /**
   * Set context for logging
   */
  setContext(context: Partial<LogContext>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Clear context
   */
  clearContext(): this {
    this.context = {};
    return this;
  }

  /**
   * Get child logger with additional context
   */
  child(bindings: LogContext): Logger {
    const child = new Logger({ service: this.service });
    child.context = { ...this.context, ...bindings };
    return child;
  }

  /**
   * Trace log
   */
  trace(message: string, ...args: unknown[]): void {
    this.logger.trace(this.context, message, ...args);
  }

  /**
   * Debug log
   */
  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(this.context, message, ...args);
  }

  /**
   * Info log
   */
  info(message: string, ...args: unknown[]): void {
    this.logger.info(this.context, message, ...args);
  }

  /**
   * Warn log
   */
  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(this.context, message, ...args);
  }

  /**
   * Error log
   */
  error(message: string, ...args: unknown[]): void {
    this.logger.error(this.context, message, ...args);
  }

  /**
   * Fatal log
   */
  fatal(message: string, ...args: unknown[]): void {
    this.logger.fatal(this.context, message, ...args);
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    switch (level) {
      case LogLevel.TRACE:
        this.trace(message, ...args);
        break;
      case LogLevel.DEBUG:
        this.debug(message, ...args);
        break;
      case LogLevel.INFO:
        this.info(message, ...args);
        break;
      case LogLevel.WARN:
        this.warn(message, ...args);
        break;
      case LogLevel.ERROR:
        this.error(message, ...args);
        break;
      case LogLevel.FATAL:
        this.fatal(message, ...args);
        break;
    }
  }

  /**
   * Create logger for a specific component
   */
  component(name: string): Logger {
    return this.child({ component: name });
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger({
  level: process.env.LOG_LEVEL as LogLevel || LogLevel.INFO,
  pretty: process.env.NODE_ENV !== 'production',
  service: 'wingetcord',
});

/**
 * Create a scoped logger
 */
export function createLogger(name: string): Logger {
  return logger.component(name);
}
