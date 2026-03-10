import pino from 'pino';

export const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});

export class Logger {
  static info(message: string, ...args: any[]) {
    logger.info(message, ...args);
  }

  static warn(message: string, ...args: any[]) {
    logger.warn(message, ...args);
  }

  static error(message: string, ...args: any[]) {
    logger.error(message, ...args);
  }

  static debug(message: string, ...args: any[]) {
    logger.debug(message, ...args);
  }
}
