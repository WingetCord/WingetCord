/**
 * Advanced Middleware System
 * Provides plugin middleware with before/after hooks and error handling
 */

import { Logger } from '../core/Logger.js';

/**
 * Middleware context
 */
export interface MiddlewareContext {
  /** Event name */
  event: string;
  /** Data passed to middleware */
  data: unknown;
  /** Timestamp */
  timestamp: number;
  /** User ID if available */
  userId?: string;
  /** Guild ID if available */
  guildId?: string;
  /** Channel ID if available */
  channelId?: string;
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Stop flag */
  stopped: boolean;
}

/**
 * Next function to call next middleware
 */
export type NextFunction = () => Promise<void>;

/**
 * Middleware function
 */
export type MiddlewareFunction = (
  ctx: MiddlewareContext,
  next: NextFunction
) => Promise<void> | void;

/**
 * Middleware options
 */
export interface MiddlewareOptions {
  /** Middleware name */
  name: string;
  /** Event(s) to filter (empty = all events) */
  events?: string[];
  /** Priority (lower = earlier) */
  priority?: number;
  /** Error handler */
  onError?: (error: Error, ctx: MiddlewareContext) => void;
}

/**
 * Middleware definition
 */
export interface MiddlewareDefinition {
  handler: MiddlewareFunction;
  options: MiddlewareOptions;
}

/**
 * Middleware manager
 */
export class MiddlewareManager {
  private middlewares: MiddlewareDefinition[] = [];
  private globalMiddlewares: MiddlewareDefinition[] = [];

  /**
   * Use a middleware
   */
  use(handler: MiddlewareFunction, options: MiddlewareOptions): this {
    const definition: MiddlewareDefinition = {
      handler,
      options: {
        priority: options.priority ?? 100,
        ...options,
      },
    };

    if (!options.events || options.events.length === 0) {
      // Global middleware
      this.globalMiddlewares.push(definition);
      this.sortMiddlewares();
    } else {
      // Event-specific middleware
      this.middlewares.push(definition);
      this.sortMiddlewares();
    }

    return this;
  }

  /**
   * Register middleware for specific events
   */
  on(event: string, handler: MiddlewareFunction, options?: Partial<MiddlewareOptions>): this {
    return this.use(handler, {
      name: options?.name || handler.name || 'anonymous',
      events: [event],
      ...options,
    });
  }

  /**
   * Register global middleware (runs on all events)
   */
  global(handler: MiddlewareFunction, options?: Partial<MiddlewareOptions>): this {
    return this.use(handler, {
      name: options?.name || handler.name || 'anonymous',
      ...options,
    });
  }

  /**
   * Execute middleware chain for an event
   */
  async execute(event: string, data: unknown, context: Partial<MiddlewareContext> = {}): Promise<void> {
    const ctx: MiddlewareContext = {
      event,
      data,
      timestamp: Date.now(),
      metadata: {},
      stopped: false,
      ...context,
    };

    // Get applicable middlewares
    const applicable = [
      ...this.globalMiddlewares,
      ...this.middlewares.filter(m => 
        m.options.events?.includes(event)
      ),
    ];

    // Build chain
    let index = 0;

    const next: NextFunction = async () => {
      if (ctx.stopped || index >= applicable.length) {
        return;
      }

      const middleware = applicable[index++];
      
      if (!middleware) return;
      
      try {
        await middleware.handler(ctx, next);
      } catch (error) {
        Logger.error(`[Middleware:${middleware.options.name}] Error:`, error);
        
        if (middleware.options.onError) {
          middleware.options.onError(error as Error, ctx);
        } else {
          // Default error handling
          throw error;
        }
      }
    };

    await next();
  }

  /**
   * Stop propagation
   */
  stop(ctx: MiddlewareContext): void {
    ctx.stopped = true;
  }

  /**
   * Remove a middleware by name
   */
  remove(name: string): boolean {
    const beforeGlobal = this.globalMiddlewares.length;
    const before = this.middlewares.length;
    
    this.globalMiddlewares = this.globalMiddlewares.filter(m => m.options.name !== name);
    this.middlewares = this.middlewares.filter(m => m.options.name !== name);
    
    return this.globalMiddlewares.length < beforeGlobal || this.middlewares.length < before;
  }

  /**
   * Clear all middlewares
   */
  clear(): void {
    this.middlewares = [];
    this.globalMiddlewares = [];
  }

  /**
   * Get middleware count
   */
  get count(): number {
    return this.middlewares.length + this.globalMiddlewares.length;
  }

  /**
   * Sort middlewares by priority
   */
  private sortMiddlewares(): void {
    this.middlewares.sort((a, b) => 
      (a.options.priority ?? 100) - (b.options.priority ?? 100)
    );
    this.globalMiddlewares.sort((a, b) => 
      (a.options.priority ?? 100) - (b.options.priority ?? 100)
    );
  }
}

// ============== Built-in Middleware ==============

/**
 * Rate limiter middleware
 */
export function createRateLimiter(
  limit: number,
  windowMs: number
): MiddlewareFunction {
  const buckets = new Map<string, { count: number; resetTime: number }>();

  return async (ctx, next) => {
    const key = ctx.userId || ctx.guildId || 'global';
    const now = Date.now();
    
    let bucket = buckets.get(key);
    
    if (!bucket || bucket.resetTime < now) {
      bucket = { count: 0, resetTime: now + windowMs };
      buckets.set(key, bucket);
    }

    if (bucket.count >= limit) {
      Logger.warn(`[RateLimiter] Rate limit exceeded for ${key}`);
      ctx.stopped = true;
      return;
    }

    bucket.count++;
    await next();
  };
}

/**
 * Validation middleware
 */
export function createValidator(
  schema: Record<string, (value: unknown) => boolean>
): MiddlewareFunction {
  return async (ctx, next) => {
    const data = ctx.data as Record<string, unknown>;
    
    for (const [field, validator] of Object.entries(schema)) {
      if (!validator(data[field])) {
        throw new Error(`Validation failed for field: ${field}`);
      }
    }

    await next();
  };
}

/**
 * Logging middleware
 */
export function createLoggingMiddleware(): MiddlewareFunction {
  return async (ctx, next) => {
    const start = Date.now();
    
    Logger.debug(`[Middleware:Logger] ${ctx.event} started`);
    
    await next();
    
    const duration = Date.now() - start;
    Logger.debug(`[Middleware:Logger] ${ctx.event} completed in ${duration}ms`);
  };
}

/**
 * Error handler middleware
 */
export function createErrorHandler(
  handler: (error: Error, ctx: MiddlewareContext) => void
): MiddlewareFunction {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      handler(error as Error, ctx);
    }
  };
}
