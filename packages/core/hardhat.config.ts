import toolbox from "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [toolbox],
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
  },
  solidity: {
    version: "0.8.29",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 1,
      },
      viaIR: true,
    },
  },
};

export default config;
