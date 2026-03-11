/**
 * Advanced Task Scheduler
 * Features: Cron-based, interval, and one-time tasks
 */
import cron from 'cron-parser';
import { WingetCordError } from '../errors/WingetCordError.js';

interface TaskContext {
  taskId: string;
  executionCount: number;
  lastRun: Date;
}

type TaskHandler = (ctx: TaskContext) => Promise<void>;

interface Task {
  id: string;
  type: 'cron' | 'interval' | 'once';
  handler: TaskHandler;
  timer?: ReturnType<typeof setInterval> | ReturnType<typeof setTimeout>;
  executionCount: number;
  lastRun?: Date;
}

export type { TaskContext, TaskHandler };

export class Scheduler {
  private tasks = new Map<string, Task>();
  private readonly maxConcurrent: number;
  private activeCount = 0;

  constructor(options: { maxConcurrent?: number } = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 10;
  }

  /**
   * Schedule a cron-based task
   */
  scheduleCron(expression: string, handler: TaskHandler): string {
    try {
      cron.parseExpression(expression);
    } catch {
      throw new WingetCordError(`Invalid cron expression: ${expression}`, 'INVALID_CRON');
    }

    const id = `cron_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const task: Task = { id, type: 'cron', handler, executionCount: 0 };

    const tick = () => {
      const interval = cron.parseExpression(expression);
      const next = interval.next().toDate();
      const delay = next.getTime() - Date.now();

      task.timer = setTimeout(async () => {
        await this.runTask(task);
        tick();
      }, delay);
    };

    tick();
    this.tasks.set(id, task);
    return id;
  }

  /**
   * Schedule an interval-based task
   */
  scheduleInterval(ms: number, handler: TaskHandler): string {
    if (ms < 100) {
      throw new WingetCordError('Interval must be >= 100ms', 'INVALID_INTERVAL');
    }

    const id = `interval_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const task: Task = { id, type: 'interval', handler, executionCount: 0 };
    task.timer = setInterval(() => this.runTask(task), ms);
    this.tasks.set(id, task);
    return id;
  }

  /**
   * Schedule a one-time task
   */
  scheduleOnce(ms: number, handler: TaskHandler): string {
    if (ms < 0) {
      throw new WingetCordError('Delay must be >= 0', 'INVALID_DELAY');
    }

    const id = `once_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const task: Task = { id, type: 'once', handler, executionCount: 0 };
    task.timer = setTimeout(async () => {
      await this.runTask(task);
      this.tasks.delete(id);
    }, ms);
    this.tasks.set(id, task);
    return id;
  }

  /**
   * Cancel a task
   */
  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    if (task.timer) {
      if (task.type === 'interval') {
        clearInterval(task.timer as ReturnType<typeof setInterval>);
      } else {
        clearTimeout(task.timer as ReturnType<typeof setTimeout>);
      }
    }
    this.tasks.delete(taskId);
    return true;
  }

  /**
   * Stop all tasks
   */
  stopAll(): void {
    for (const [id] of this.tasks) {
      this.cancel(id);
    }
  }

  /**
   * Get all scheduled task IDs
   */
  getTaskIds(): string[] {
    return Array.from(this.tasks.keys());
  }

  /**
   * Get number of active tasks
   */
  get taskCount(): number {
    return this.tasks.size;
  }

  private async runTask(task: Task): Promise<void> {
    if (this.activeCount >= this.maxConcurrent) return;
    this.activeCount++;
    
    try {
      task.lastRun = new Date();
      task.executionCount++;
      await task.handler({
        taskId: task.id,
        executionCount: task.executionCount,
        lastRun: task.lastRun,
      });
    } catch (err) {
      console.error(`[Scheduler] Task ${task.id} failed:`, err);
    } finally {
      this.activeCount--;
    }
  }
}
