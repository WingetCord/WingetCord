export type MiddlewareFn = (context: unknown, next: () => Promise<void>) => Promise<void>;

export class MiddlewarePipeline {
  private middleware: MiddlewareFn[] = [];

  use(fn: MiddlewareFn): void {
    this.middleware.push(fn);
  }

  async execute(context: unknown): Promise<void> {
    let index = 0;
    const next = async (): Promise<void> => {
      if (index >= this.middleware.length) return;
      const fn: MiddlewareFn = this.middleware[index++]!;
      await fn(context, next);
    };
    await next();
  }
}
