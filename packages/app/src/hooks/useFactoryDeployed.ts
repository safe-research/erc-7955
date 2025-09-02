import { factory } from "@safe-research/erc-7955";
import { useMemo } from "react";
import { useBytecode } from "wagmi";

function useFactoryDeployed() {
  const bytecode = useBytecode({
    address: factory.address,
  });
  return useMemo(
    () => ({
      ...bytecode,
      data: bytecode.data === factory.runtimeCode,
    }),
    [bytecode],
  );
}

export { useFactoryDeployed };
