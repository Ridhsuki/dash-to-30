type EventCallback = (...args: any[]) => void;

class SafeEventBus {
  private readonly events = new Map<string, Set<EventCallback>>();

  on(eventName: string, callback: EventCallback) {
    const callbacks = this.events.get(eventName) ?? new Set<EventCallback>();
    callbacks.add(callback);
    this.events.set(eventName, callbacks);

    return this;
  }

  once(eventName: string, callback: EventCallback) {
    const onceCallback: EventCallback = (...args) => {
      this.off(eventName, onceCallback);
      callback(...args);
    };

    return this.on(eventName, onceCallback);
  }

  off(eventName: string, callback: EventCallback) {
    const callbacks = this.events.get(eventName);

    if (!callbacks) return this;

    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.events.delete(eventName);
    }

    return this;
  }

  emit(eventName: string, ...args: any[]) {
    const callbacks = this.events.get(eventName);

    if (!callbacks) return false;

    callbacks.forEach((callback) => callback(...args));
    return true;
  }

  removeAllListeners(eventName?: string) {
    if (eventName) {
      this.events.delete(eventName);
      return this;
    }

    this.events.clear();
    return this;
  }
}

export const EventBus = new SafeEventBus();
