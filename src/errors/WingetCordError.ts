/**
 * WingetCord Error Classes
 * Hierarchical error system for better error handling
 */

export class WingetCordError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'WingetCordError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GatewayError extends WingetCordError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'GatewayError';
  }
}

export class RESTError extends WingetCordError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
    public readonly body?: unknown
  ) {
    super(message, `REST_${status}`);
    this.name = 'RESTError';
  }
}

export class RateLimitError extends RESTError {
  constructor(
    message: string,
    status: number,
    path: string,
    public readonly retryAfter: number
  ) {
    super(message, status, path);
    this.name = 'RateLimitError';
  }
}

export class VoiceError extends WingetCordError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'VoiceError';
  }
}

export class PluginError extends WingetCordError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'PluginError';
  }
}

export class ValidationError extends WingetCordError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
