import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

export const zgMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "0G Explorer", url: "https://chainscan.0g.ai" },
  },
});

export const wagmiConfig = createConfig({
  chains: [zgMainnet],
  transports: {
    [zgMainnet.id]: http(),
  },
});
