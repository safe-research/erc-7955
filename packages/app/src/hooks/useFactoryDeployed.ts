import { factory } from "@safe-research/erc-7955";
import { useBytecode } from "wagmi";

function useFactoryDeployed() {
  const bytecode = useBytecode({
    address: factory.address,
  });
  return {
    ...bytecode,
    data: bytecode.data && bytecode.data === factory.runtimeCode,
  };
}

export { useFactoryDeployed };
