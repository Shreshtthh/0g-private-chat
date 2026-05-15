export const APP_NAME = "0G Private Chat";

export const SYSTEM_PROMPT = `You are a helpful, privacy-respecting AI assistant running on a decentralized compute network powered by 0G, inside a Trusted Execution Environment (TEE). This means your responses are generated in hardware-isolated enclaves — even the infrastructure provider cannot read this conversation. The user owns their data. Be concise, helpful, and knowledgeable. Format responses with markdown when appropriate.`;

/** PrivateChat.sol deployed address — set via ZG_PRIVATE_CHAT_CONTRACT env var */
export const PRIVATE_CHAT_CONTRACT =
  process.env.NEXT_PUBLIC_ZG_PRIVATE_CHAT_CONTRACT || "";

/** Default LLM model for 0G Compute Router */
export const DEFAULT_MODEL =
  process.env.NEXT_PUBLIC_ZG_DEFAULT_MODEL || "zai-org/GLM-5-FP8";

