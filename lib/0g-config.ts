/**
 * 0G Network Configuration
 * Shared constants for Chain, Storage, and Compute integrations.
 */

export const ZG_NETWORKS = {
  testnet: {
    name: "0G-Galileo-Testnet",
    chainId: 16602,
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    explorer: "https://chainscan-galileo.0g.ai",
    explorerHome: "https://explorer.0g.ai/testnet/home",
    storageIndexerTurbo: "https://indexer-storage-testnet-turbo.0g.ai",
    storageIndexerStandard: "https://indexer-storage-testnet-standard.0g.ai",
    flowContract: "0x22E03a6A89B950F1c82ec5e74F8eCa321a105296",
    computeRouter: "https://router-api-testnet.integratenetwork.work/v1",
    computeDashboard: "https://pc.testnet.0g.ai",
    faucet: "https://faucet.0g.ai",
  },
  mainnet: {
    name: "0G-Aristotle-Mainnet",
    chainId: 0, // TODO: fill when deploying to mainnet
    rpcUrl: "",
    explorer: "https://chainscan.0g.ai",
    explorerHome: "https://explorer.0g.ai",
    storageIndexerTurbo: "",
    storageIndexerStandard: "",
    flowContract: "",
    computeRouter: "https://router-api.0g.ai/v1",
    computeDashboard: "https://pc.0g.ai",
    faucet: "",
  },
} as const;

/** Active network — change to "mainnet" for final submission */
export const ACTIVE_NETWORK = "testnet" as const;

/** Get the active network config */
export function getNetworkConfig() {
  return ZG_NETWORKS[ACTIVE_NETWORK];
}

/** Build an explorer URL for a transaction hash */
export function getTxExplorerUrl(txHash: string): string {
  const config = getNetworkConfig();
  return `${config.explorer}/tx/${txHash}`;
}

/** Build an explorer URL for a contract address */
export function getAddressExplorerUrl(address: string): string {
  const config = getNetworkConfig();
  return `${config.explorer}/address/${address}`;
}
