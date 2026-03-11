type Listener<T> = (newValue: T, oldValue: T) => void;

export class ReactiveStore<T extends Record<string, unknown>> {
  public state: T;
  private listeners = new Map<keyof T, Set<Listener<unknown>>>();
  private globalListeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = { ...initialState };
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const oldValue = this.state[key];
    if (oldValue === value) return;

    this.state[key] = value;

    // Notify specific key listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      for (const listener of keyListeners) {
        listener(value as unknown as T, oldValue as unknown as T);
      }
    }

    // Notify global listeners
    for (const listener of this.globalListeners) {
      listener(this.state as T, { ...this.state, [key]: oldValue } as T);
    }
  }

  update(partial: Partial<T>): void {
    for (const [key, value] of Object.entries(partial)) {
      this.set(key as keyof T, value as T[keyof T]);
    }
  }

  getState(): Readonly<T> {
    return { ...this.state };
  }

  subscribe<K extends keyof T>(key: K, listener: Listener<T[K]>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener as Listener<unknown>);

    return () => {
      this.listeners.get(key)?.delete(listener as Listener<unknown>);
    };
  }

  subscribeAll(listener: Listener<T>): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  reset(newState: T): void {
    const oldState = { ...this.state };
    this.state = { ...newState };

    for (const listener of this.globalListeners) {
      listener(this.state, oldState);
    }
  }
}
