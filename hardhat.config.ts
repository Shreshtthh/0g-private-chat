import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      evmVersion: "paris",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    "0g-testnet": {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: process.env.ZG_DEPLOYER_PRIVATE_KEY
        ? [process.env.ZG_DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;
