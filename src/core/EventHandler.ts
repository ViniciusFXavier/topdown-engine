export type Listener<T = any> = (payload: T) => void;

export interface IEventMap {}

export class EventHandler<Events extends IEventMap = IEventMap> {
  private listeners: {
    [K in keyof Events]?: Listener<Events[K]>[];
  } = {};

  on<K extends keyof Events>(eventName: K, listener: Listener<Events[K]>): this {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(listener);
    return this;
  }

  off<K extends keyof Events>(eventName: K, listener: Listener<Events[K]>): this {
    this.listeners[eventName] = this.listeners[eventName]?.filter(l => l !== listener);
    return this;
  }

  emit<K extends keyof Events>(eventName: K, data?: Events[K]): this {
    this.listeners[eventName]?.forEach(fn => fn(data as Events[K]));
    return this;
  }
}