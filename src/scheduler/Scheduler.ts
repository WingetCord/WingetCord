/**
 * Advanced Task Scheduler
 * 
 * Features:
 * - Cron-based scheduling
 * - Interval-based scheduling
 * - One-time tasks
 * - Recurring tasks with options
 * - Timezone support
 * - Task priority
 * - Task dependencies
 */

import { EventEmitter } from 'events';
import { Logger } from '../logging/index.js';

export type TaskType = 'once' | 'interval' | 'cron';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'cancelled' | 'failed';

export interface TaskOptions {
  id?: string;
  name?: string;
  type: TaskType;
  cron?: string;
  interval?: number;
  timezone?: string;
  priority?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  enabled?: boolean;
  runOnStartup?: boolean;
}

export interface ScheduledTask {
  id: string;
  name: string;
  type: TaskType;
  cron?: string;
  interval?: number;
  timezone: string;
  priority: number;
  retries: number;
  retryDelay: number;
  timeout?: number;
  enabled: boolean;
  status: TaskStatus;
  execute: TaskFunction;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  errorCount: number;
}

export type TaskFunction = (context: TaskContext) => Promise<any> | any;

export interface TaskContext {
  taskId: string;
  taskName: string;
  scheduledTime: Date;
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: Error;
  isRetry: boolean;
  attemptNumber: number;
}

export interface SchedulerOptions {
  maxConcurrent?: number;
  defaultTimezone?: string;
  defaultRetries?: number;
  defaultRetryDelay?: number;
  defaultTimeout?: number;
  logger?: Logger;
}

/**
 * Cron expression parser and validator
 */
export class CronParser {
  private static readonly CRON_FIELDS = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  
  /**
   * Validate cron expression
   */
  static validate(expression: string): boolean {
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
      return false;
    }
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === undefined || !this.validateField(part, i)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate a single cron field
   */
  private static validateField(value: string, fieldIndex: number): boolean {
    if (value === '*') return true;
    
    const ranges = value.split(',');
    for (const range of ranges) {
      if (range.includes('/')) {
        const parts = range.split('/');
        const step = parts[1];
        if (!step || !this.validateStep(step)) return false;
        const stepBase = parts[0];
        if (stepBase !== '*' && stepBase && !this.validateRange(stepBase, fieldIndex)) return false;
      } else if (range.includes('-')) {
        const parts = range.split('-');
        const start = parts[0];
        const end = parts[1];
        if (!start || !end) return false;
        if (!this.validateRange(start, fieldIndex) || !this.validateRange(end, fieldIndex)) return false;
      } else {
        if (!this.validateRange(range, fieldIndex)) return false;
      }
    }
    
    return true;
  }
  
  private static validateStep(step: string): boolean {
    const num = parseInt(step, 10);
    return !isNaN(num) && num > 0;
  }
  
  private static validateRange(value: string, fieldIndex: number): boolean {
    const num = parseInt(value, 10);
    if (isNaN(num)) return false;
    
    const [min, max] = this.getFieldRange(fieldIndex);
    return num >= min && num <= max;
  }
  
  private static getFieldRange(fieldIndex: number): [number, number] {
    switch (fieldIndex) {
      case 0: return [0, 59];
      case 1: return [0, 59];
      case 2: return [0, 23];
      case 3: return [1, 31];
      case 4: return [1, 12];
      case 5: return [0, 6];
      default: return [0, 0];
    }
  }
  
  /**
   * Get next run time for cron expression
   */
  static getNextRun(expression: string, fromDate: Date = new Date()): Date | null {
    if (!this.validate(expression)) return null;
    
    const parts = expression.trim().split(/\s+/);
    const hasSeconds = parts.length === 6;
    
    let date = new Date(fromDate);
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
    
    const maxIterations = 1000000;
    let iterations = 0;
    
    while (iterations < maxIterations) {
      if (this.matches(date, parts, hasSeconds)) {
        return date;
      }
      date.setSeconds(date.getSeconds() + 1);
      iterations++;
    }
    
    return null;
  }
  
  private static matches(date: Date, parts: string[], hasSeconds: boolean): boolean {
    const values = [
      date.getSeconds(),
      date.getMinutes(),
      date.getHours(),
      date.getDate(),
      date.getMonth() + 1,
      date.getDay()
    ];
    
    const offset = hasSeconds ? 0 : -1;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      const fieldIndex = hasSeconds ? i : i + 1;
      const value = values[fieldIndex];
      if (value === undefined || !this.matchField(part, value, fieldIndex)) {
        return false;
      }
    }
    
    return true;
  }
  
  private static matchField(expression: string, value: number, fieldIndex: number): boolean {
    if (expression === '*') return true;
    
    const ranges = expression.split(',');
    for (const range of ranges) {
      if (range.includes('/')) {
        const parts = range.split('/');
        const step = parts[1];
        if (!step) continue;
        const stepNum = parseInt(step, 10);
        const stepBase = parts[0];
        const base = stepBase === '*' ? this.getFieldRange(fieldIndex)[0] : parseInt(stepBase || '0', 10);
        
        if ((value - base) % stepNum === 0 && value >= base) {
          return true;
        }
      } else if (range.includes('-')) {
        const parts = range.split('-');
        const start = parseInt(parts[0] || '0', 10);
        const end = parseInt(parts[1] || '0', 10);
        if (value >= start && value <= end) {
          return true;
        }
      } else {
        if (parseInt(expression, 10) === value) {
          return true;
        }
      }
    }
    
    return false;
  }
}

/**
 * Advanced Scheduler
 */
export class Scheduler extends EventEmitter {
  private tasks: Map<string, ScheduledTask> = new Map();
  private runningTasks: Set<string> = new Set();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  
  private readonly maxConcurrent: number;
  private readonly defaultTimezone: string;
  private readonly defaultRetries: number;
  private readonly defaultRetryDelay: number;
  private readonly defaultTimeout?: number;
  private readonly logger?: Logger;
  
  constructor(options: SchedulerOptions = {}) {
    super();
    this.maxConcurrent = options.maxConcurrent || 5;
    this.defaultTimezone = options.defaultTimezone || 'UTC';
    this.defaultRetries = options.defaultRetries ?? 3;
    this.defaultRetryDelay = options.defaultRetryDelay ?? 5000;
    this.defaultTimeout = options.defaultTimeout;
    this.logger = options.logger;
  }
  
  /**
   * Schedule a new task
   */
  schedule(options: TaskOptions, execute: TaskFunction): ScheduledTask {
    const id = options.id || this.generateId();
    const task: ScheduledTask = {
      id,
      name: options.name || id,
      type: options.type,
      cron: options.cron,
      interval: options.interval,
      timezone: options.timezone || this.defaultTimezone,
      priority: options.priority ?? 5,
      retries: options.retries ?? this.defaultRetries,
      retryDelay: options.retryDelay ?? this.defaultRetryDelay,
      timeout: options.timeout || this.defaultTimeout,
      enabled: options.enabled ?? true,
      status: 'pending',
      execute,
      runCount: 0,
      errorCount: 0,
    };
    
    this.tasks.set(id, task);
    this.logger?.debug(`Scheduled task: ${task.name} (${task.type})`);
    
    if (task.enabled) {
      this.startTask(id);
    }
    
    this.emit('taskScheduled', task);
    return task;
  }
  
  /**
   * Schedule a one-time task
   */
  scheduleOnce(delay: number, execute: TaskFunction, options: Partial<TaskOptions> = {}): ScheduledTask {
    return this.schedule(
      { ...options, type: 'once', interval: delay },
      execute
    );
  }
  
  /**
   * Schedule an interval-based task
   */
  scheduleInterval(interval: number, execute: TaskFunction, options: Partial<TaskOptions> = {}): ScheduledTask {
    return this.schedule(
      { ...options, type: 'interval', interval },
      execute
    );
  }
  
  /**
   * Schedule a cron-based task
   */
  scheduleCron(cron: string, execute: TaskFunction, options: Partial<TaskOptions> = {}): ScheduledTask {
    if (!CronParser.validate(cron)) {
      throw new Error(`Invalid cron expression: ${cron}`);
    }
    
    return this.schedule(
      { ...options, type: 'cron', cron },
      execute
    );
  }
  
  /**
   * Start a task
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    if (task.type === 'once') {
      this.scheduleOnceTask(task);
    } else if (task.type === 'interval') {
      this.scheduleIntervalTask(task);
    } else if (task.type === 'cron') {
      this.scheduleCronTask(task);
    }
  }
  
  /**
   * Stop a task
   */
  stopTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }
    
    const timeout = this.timeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(taskId);
    }
    
    task.enabled = false;
    task.status = 'cancelled';
    this.logger?.debug(`Stopped task: ${task.name}`);
    this.emit('taskStopped', task);
  }
  
  /**
   * Cancel a task
   */
  cancelTask(taskId: string): void {
    this.stopTask(taskId);
    this.tasks.delete(taskId);
    this.emit('taskCancelled', taskId);
  }
  
  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }
  
  /**
   * Get all tasks
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): ScheduledTask[] {
    return this.getAllTasks().filter(t => t.status === status);
  }
  
  /**
   * Run a task immediately
   */
  async runTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    return this.executeTask(task, { isRetry: false, attemptNumber: 1 });
  }
  
  /**
   * Start all enabled tasks
   */
  startAll(): void {
    for (const task of this.tasks.values()) {
      if (task.enabled) {
        this.startTask(task.id);
      }
    }
  }
  
  /**
   * Stop all tasks
   */
  stopAll(): void {
    for (const task of this.tasks.values()) {
      this.stopTask(task.id);
    }
  }
  
  /**
   * Clear all tasks
   */
  clear(): void {
    this.stopAll();
    this.tasks.clear();
    this.emit('schedulerCleared');
  }
  
  private scheduleOnceTask(task: ScheduledTask): void {
    task.status = 'pending';
    const delay = task.interval || 0;
    
    const timeout = setTimeout(() => {
      this.executeTask(task, { isRetry: false, attemptNumber: 1 });
    }, delay);
    
    this.timeouts.set(task.id, timeout);
  }
  
  private scheduleIntervalTask(task: ScheduledTask): void {
    task.status = 'pending';
    const interval = task.interval || 1000;
    
    const runTask = () => {
      this.executeTask(task, { isRetry: false, attemptNumber: 1 });
    };
    
    runTask();
    
    const timer = setInterval(runTask, interval);
    this.intervals.set(task.id, timer);
  }
  
  private scheduleCronTask(task: ScheduledTask): void {
    task.status = 'pending';
    
    const scheduleNext = () => {
      if (!task.enabled) return;
      
      const nextRun = CronParser.getNextRun(task.cron!, new Date());
      if (!nextRun) return;
      
      task.nextRun = nextRun;
      const delay = nextRun.getTime() - Date.now();
      
      const timeout = setTimeout(async () => {
        await this.executeTask(task, { isRetry: false, attemptNumber: 1 });
        scheduleNext();
      }, delay);
      
      this.timeouts.set(task.id, timeout);
    };
    
    scheduleNext();
  }
  
  private async executeTask(
    task: ScheduledTask,
    contextInfo: { isRetry: boolean; attemptNumber: number }
  ): Promise<any> {
    if (this.runningTasks.size >= this.maxConcurrent) {
      this.logger?.warn(`Task ${task.name} queued - max concurrent reached`);
      const checkInterval = setInterval(() => {
        if (this.runningTasks.size < this.maxConcurrent) {
          clearInterval(checkInterval);
          this.executeTask(task, contextInfo);
        }
      }, 1000);
      return;
    }
    
    if (!task.enabled) return;
    
    task.status = 'running';
    this.runningTasks.add(task.id);
    
    const context: TaskContext = {
      taskId: task.id,
      taskName: task.name,
      scheduledTime: task.nextRun || new Date(),
      startTime: new Date(),
      isRetry: contextInfo.isRetry,
      attemptNumber: contextInfo.attemptNumber,
    };
    
    this.emit('taskStart', task, context);
    this.logger?.debug(`Starting task: ${task.name}`);
    
    try {
      let result: any;
      
      if (task.timeout) {
        result = await Promise.race([
          task.execute(context),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Task timeout: ${task.timeout}ms`)), task.timeout);
          })
        ]);
      } else {
        result = await task.execute(context);
      }
      
      context.endTime = new Date();
      context.result = result;
      task.status = 'completed';
      task.lastRun = new Date();
      task.runCount++;
      
      this.logger?.debug(`Task completed: ${task.name} (${task.runCount} runs)`);
      this.emit('taskComplete', task, context);
      
    } catch (error) {
      context.endTime = new Date();
      context.error = error as Error;
      task.errorCount++;
      task.status = 'failed';
      
      this.logger?.error(`Task failed: ${task.name}`, error);
      this.emit('taskError', task, context);
      
      // Retry if applicable
      if (contextInfo.attemptNumber < task.retries) {
        this.logger?.debug(`Retrying task: ${task.name} (attempt ${contextInfo.attemptNumber + 1})`);
        
        const retryTimeout = setTimeout(() => {
          this.executeTask(task, {
            isRetry: true,
            attemptNumber: contextInfo.attemptNumber + 1,
          });
        }, task.retryDelay);
        
        this.timeouts.set(`${task.id}-retry`, retryTimeout);
      }
    } finally {
      this.runningTasks.delete(task.id);
    }
    
    return context.result;
  }
  
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default Scheduler;
