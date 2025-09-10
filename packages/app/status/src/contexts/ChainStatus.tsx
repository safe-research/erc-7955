import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { type Chain, ChainRegistry } from "$status/lib/registry.ts";

const ChainStatusContext = createContext<ChainRegistry | null>(null);

function ChainStatusProvider({
  chains,
  concurrency = 42,
  children,
}: {
  chains: Chain[];
  concurrency?: number;
  children?: ReactNode;
}) {
  const [value, setValue] = useState<ChainRegistry | null>(null);
  useEffect(() => {
    const registry = new ChainRegistry({ chains, concurrency });
    setValue(registry);
    return () => registry.destroy();
  }, [chains, concurrency]);

  return (
    !!value && <ChainStatusContext value={value}>{children}</ChainStatusContext>
  );
}

function useChainStatusCounters() {
  const registry = useContext(ChainStatusContext);
  if (!registry) {
    throw new Error("chain status counters only accessible in provider");
  }

  const [counters, setCounters] = useState(registry.counters());
  useEffect(() => {
    return registry.watchCounters({ callback: setCounters });
  }, [registry]);

  return counters;
}

function useChainStatus({ chain }: { chain: Chain }) {
  const registry = useContext(ChainStatusContext);
  if (!registry) {
    throw new Error("chain status only accessible in provider");
  }

  const [status, setStatus] = useState(registry.status({ chain }));
  useEffect(() => {
    return registry.watchStatus({ chain, callback: setStatus });
  }, [chain, registry]);

  return status;
}

export { ChainStatusProvider, useChainStatusCounters, useChainStatus };
