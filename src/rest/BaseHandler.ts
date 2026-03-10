import type { RESTManager } from '../core/RESTManager.js';

export abstract class BaseHandler {
  constructor(protected rest: RESTManager) {}
}
