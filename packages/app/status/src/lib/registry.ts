import { type Chain, detectStatus, type Status } from "$status/lib/chain.ts";
import { type Callback, Channel } from "$status/lib/channel.ts";
import { Queue } from "$status/lib/queue.ts";

type Counters = {
  total: number;
  pending: number;
} & {
  [K in Status]: number;
};

class ChainRegistry {
  #statuses: Record<number, Channel<Status | null>>;
  #counters: Channel<Counters>;
  #queue: Queue;
  #background?: Promise<void>;

  constructor({
    chains,
    concurrency,
  }: { chains: Chain[]; concurrency: number }) {
    this.#statuses = {};
    this.#counters = new Channel({
      total: chains.length,
      pending: chains.length,
      deployed: 0,
      supported: 0,
      notsupported: 0,
      unavailable: 0,
    });
    this.#queue = new Queue(concurrency);
    this.#background = this.#initialize(chains);
  }

  async #initialize(chains: Chain[]) {
    for (const chain of chains) {
      this.#queue.enqueue(() => this.#updateStatus(chain));
    }
  }

  #status({ chainId }: Pick<Chain, "chainId">) {
    if (!this.#statuses[chainId]) {
      this.#statuses[chainId] = new Channel<Status | null>(null);
    }
    return this.#statuses[chainId];
  }

  async #updateStatus(chain: Chain) {
    const status = await detectStatus(chain);
    this.#status(chain).publish(status);
    const counters = { ...this.#counters.value };
    counters.pending -= 1;
    counters[status] += 1;
    this.#counters.publish(counters);
  }

  public counters() {
    return this.#counters.value;
  }

  public watchCounters({ callback }: { callback: Callback<Counters> }) {
    callback(this.#counters.value);
    return this.#counters.subscribe(callback);
  }

  public status({ chain }: { chain: Pick<Chain, "chainId"> }) {
    return this.#status(chain).value;
  }

  public watchStatus({
    chain,
    callback,
  }: {
    chain: Pick<Chain, "chainId">;
    callback: Callback<Status | null>;
  }) {
    const status = this.#status(chain);
    callback(status.value);
    return status.subscribe(callback);
  }

  public get background() {
    return this.#background;
  }

  public destroy() {
    this.#queue.clear();
    this.#background = undefined;
  }
}

export type { Chain };
export { ChainRegistry };
