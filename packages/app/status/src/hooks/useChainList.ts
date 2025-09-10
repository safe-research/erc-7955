import { useQuery } from "@tanstack/react-query";

interface Chain {
  name: string;
  chain: string;
  icon?: string;
  rpc: {
    url: string;
  }[];
  chainId: number;
}

function useChainList() {
  return useQuery({
    queryKey: ["chainlist"],
    queryFn: async () => {
      const response = await fetch("https://chainlist.org/rpcs.json");
      const chains: Chain[] = await response.json();
      chains.sort((a, b) => a.chainId - b.chainId);
      return chains;
    },
  });
}

export type { Chain };
export { useChainList };
