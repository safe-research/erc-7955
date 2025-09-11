interface Task {
  release(aquired: boolean): void;
  next?: Task;
}

class Queue {
  #concurrency: number;
  #queue?: {
    head: Task;
    tail: Task;
  };

  constructor(concurrency: number) {
    if (concurrency <= 0) {
      throw new Error("invalid concurrency parameter");
    }

    this.#concurrency = concurrency;
  }

  #lock() {
    if (this.#concurrency === -1) {
      throw new Error("rate limiter was cleared");
    }

    return new Promise((resolve) => {
      if (this.#concurrency > 0) {
        this.#concurrency--;
        resolve(true);
      } else {
        const task = { release: resolve };
        if (this.#queue) {
          this.#queue.tail.next = task;
          this.#queue.tail = task;
        } else {
          this.#queue = { head: task, tail: task };
        }
      }
    });
  }

  #release() {
    if (this.#queue) {
      this.#queue.head.release(true);
      if (this.#queue.head.next) {
        this.#queue.head = this.#queue.head.next;
      } else {
        this.#queue = undefined;
      }
    } else {
      this.#concurrency++;
    }
  }

  public async enqueue<T>(f: () => Promise<T>) {
    const aquired = await this.#lock();
    if (!aquired) {
      return null;
    }
    try {
      return await f();
    } finally {
      this.#release();
    }
  }

  public clear() {
    this.#concurrency = -1;
    for (let current = this.#queue?.head; current; current = current.next) {
      current.release(false);
    }
    this.#queue = undefined;
  }
}

export { Queue };
