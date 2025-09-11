type Callback<T> = (value: T) => void;
type Unsubscribe = () => void;

class Channel<T> {
  #value: T;
  #callbacks: Map<symbol, Callback<T>>;

  constructor(value: T) {
    this.#value = value;
    this.#callbacks = new Map();
  }

  public get value() {
    return this.#value;
  }

  public subscribe(callback: Callback<T>): Unsubscribe {
    const id = Symbol();
    this.#callbacks.set(id, callback);
    return () => {
      this.#callbacks.delete(id);
    };
  }

  public publish(value: T) {
    this.#value = value;
    for (const callback of this.#callbacks.values()) {
      callback(this.#value);
    }
  }
}

export type { Callback, Unsubscribe };
export { Channel };
