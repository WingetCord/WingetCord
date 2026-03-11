export interface Plugin {
  name: string;
  version: string;
  load(): Promise<void> | void;
  unload(): Promise<void> | void;
}
