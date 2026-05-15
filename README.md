# 0G Private Chat

**The first AI chatbot where your conversations are truly yours.**

Every day, billions of messages are sent to AI chatbots. Every single one is stored on corporate servers, read by content moderation pipelines, and used to train the next generation of models. Users have no control, no ownership, and no proof of what happens to their data after they hit "Send."

0G Private Chat changes this. It is a fully functional AI chatbot built entirely on 0G's decentralized modular stack. Your messages are processed inside hardware-isolated Trusted Execution Environments where not even the infrastructure provider can read them. Your conversations are encrypted with AES-256 and stored across a decentralized storage network where no single entity holds the complete data. And every interaction produces a verifiable, on-chain proof that you can audit at any time.

This is not a prototype. This is not a mockup. This is a working application deployed on the 0G Galileo Testnet, using real 0G Compute nodes, real 0G Storage infrastructure, and a real smart contract recording every save operation on-chain.

---

## The Problem

When you use ChatGPT, Claude, or any centralized AI service, you are making an implicit trade: your private thoughts in exchange for useful responses. The company sees everything. They store everything. And you have zero cryptographic guarantee that your data is handled the way they claim.

For individuals, this means private medical questions, legal concerns, financial plans, and personal struggles are all sitting on someone else's server. For enterprises, this means proprietary code, trade secrets, and confidential strategy discussions are one breach away from exposure.

The AI industry has a trust problem. 0G Private Chat is the solution.

## The Solution

0G Private Chat replaces every centralized component of a traditional AI chatbot with its decentralized equivalent from the 0G modular stack:

| Traditional Chatbot | 0G Private Chat |
|---|---|
| Corporate GPU cluster | **0G Compute** with TEE attestation |
| Company database | **0G Storage** with AES-256 encryption |
| No audit trail | **0G Chain** with on-chain proof registry |
| Trust the company | **Trust the math** |

---

## Architecture

```
                                    0G PRIVATE CHAT ARCHITECTURE
                                    
    +------------------+         +------------------------+         +-------------------+
    |                  |         |                        |         |                   |
    |   User Browser   | ------>>|   Next.js Server       | ------>>|  0G Compute       |
    |   (React 19)     | <<------|   (API Routes)         | <<-----|  Router            |
    |                  |         |                        |         |  (TEE Inference)  |
    +--------+---------+         +-----------+------------+         +-------------------+
             |                               |                               |
             |  MetaMask                     |  Server Wallet                 |  TDX Attestation
             |  (User signs)                 |  (Pays storage)               |  (Hardware proof)
             |                               |                               |
    +--------v---------+         +-----------v------------+         +-------------------+
    |                  |         |                        |         |                   |
    |   PrivateChat    |         |   0G Storage           |         |   Qwen 2.5 7B     |
    |   Contract       |         |   Network              |         |   (TEE-attested)  |
    |   (0G Chain)     |         |   (Decentralized)      |         |                   |
    +------------------+         +------------------------+         +-------------------+
    
    Chain ID: 16602                2 Storage Nodes                  TDX Verified
    Contract: 0xc04d2D6f...        AES-256 Encrypted                Provider: 0xa48f...
```

### Data Flow

```
User sends message
        |
        v
[1] Next.js API route receives message
        |
        v
[2] Message forwarded to 0G Compute Router
    (https://router-api-testnet.integratenetwork.work/v1)
        |
        v
[3] Router selects a TEE-attested provider node
    Provider: 0xa48f01287233509FD694a22Bf840225062E67836
    Model: qwen/qwen-2.5-7b-instruct (TDX verified)
        |
        v
[4] Response streamed back through SSE
    x_0g_trace confirms decentralized execution
        |
        v
[5] User clicks "Save to 0G"
        |
        +---> [6a] Server encrypts chat with AES-256
        |         Key derived from: keccak256(serverKey + chatId)
        |         Uploaded to 0G Storage via MemData
        |         Returns: merkleRoot + storageTxHash
        |
        +---> [6b] MetaMask prompts user to sign
                   Calls PrivateChat.saveChat(contentHash, merkleRoot, model)
                   Records immutable proof on 0G Chain
                   Returns: contractTxHash
```

---

## 0G Integration Details

### 0G Compute: Decentralized AI Inference

Every AI response in 0G Private Chat is generated by a decentralized compute provider running inside a TDX Trusted Execution Environment. The 0G Compute Router at `router-api-testnet.integratenetwork.work` selects an available provider, verifies its TEE attestation, and routes the request. The response includes an `x_0g_trace` field containing the provider's Ethereum address and billing breakdown, creating a verifiable record that no centralized entity processed the request.

**Implementation:** [`app/api/chat/route.ts`](app/api/chat/route.ts)

The route uses a custom fetch wrapper that intercepts the 0G-specific `x_0g_trace` field from the SSE stream, preventing schema validation errors while preserving standard AI SDK compatibility. This allows the application to use the Vercel AI SDK's streaming infrastructure while connecting to 0G's non-standard response format.

```typescript
const cleanFetch: typeof globalThis.fetch = async (input, init) => {
  const res = await globalThis.fetch(input, init);
  // Strip x_0g_trace from SSE chunks so the AI SDK
  // only sees standard OpenAI-shaped data
  // ...
};

const provider = createOpenAI({
  baseURL: process.env.ZG_ROUTER_BASE_URL,
  apiKey: process.env.ZG_ROUTER_API_KEY || "",
  fetch: cleanFetch,
});
```

**Verification:** The `x_0g_trace` in every response contains:
- `provider`: Ethereum address of the TEE node that ran inference
- `billing.input_cost` / `billing.output_cost`: Token-level cost breakdown
- `request_id`: Unique identifier for audit trails

### 0G Storage: Encrypted Decentralized Persistence

When a user saves a conversation, the server encrypts the entire chat transcript with AES-256 using a deterministic key derived from `keccak256(serverPrivateKey + chatId)`. This ensures that the same conversation always maps to the same encryption key, enabling future retrieval without storing keys separately.

The encrypted data is uploaded to the 0G Storage network using the `MemData` class for zero-disk-footprint uploads. The SDK automatically distributes the data across multiple storage nodes and returns a Merkle root that uniquely identifies the content.

**Implementation:** [`app/api/storage/save/route.ts`](app/api/storage/save/route.ts)

```typescript
// Deterministic encryption key derivation
const keyMaterial = ethers.solidityPackedKeccak256(
  ["string", "string"],
  [privateKey, chatId]
);
const encryptionKey = Buffer.from(keyMaterial.slice(2), "hex");

// Upload with built-in AES-256 encryption
const memData = new MemData(data);
const [tx, uploadErr] = await indexer.upload(memData, rpcUrl, signer, {
  encryption: { type: "aes256", key: encryptionKey },
});
```

**Storage proof on the 0G Storage Explorer:**
- Explorer: [storagescan-galileo.0g.ai](https://storagescan-galileo.0g.ai)
- Account: `0xf89540a95b7332199f36c77e3a0958Bd6F7e6341`
- Verified uploads with Merkle roots, transaction hashes, and file sizes

### 0G Chain: On-Chain Proof Registry

The `PrivateChat.sol` smart contract, deployed on the 0G Galileo Testnet (Chain ID 16602), serves as an immutable registry of all saved conversations. Each `saveChat` call records four pieces of information: the SHA-256 content hash of the encrypted data, the Merkle root pointing to the data's location in 0G Storage, a timestamp, and the name of the AI model that generated the responses.

**Contract Address:** [`0xc04d2D6f8AB14eB01f67b1e5Be5bf204c5AA2212`](https://chainscan-galileo.0g.ai/address/0xc04d2D6f8AB14eB01f67b1e5Be5bf204c5AA2212)

**Implementation:** [`contracts/PrivateChat.sol`](contracts/PrivateChat.sol)

```solidity
function saveChat(
    bytes32 contentHash,
    bytes32 merkleRoot,
    string calldata model
) external {
    require(registeredUsers[msg.sender], "Not registered");
    userChats[msg.sender].push(
        ChatRecord(contentHash, merkleRoot, block.timestamp, model)
    );
    totalChats++;
    emit ChatSaved(msg.sender, contentHash, merkleRoot, model, block.timestamp);
}
```

The contract emits `ChatSaved` events that can be indexed and queried, enabling users to build a complete audit trail of their AI interactions without relying on any centralized service.

---

## User Flow

### 1. Connect Wallet
The user connects their MetaMask wallet via the sidebar. The application uses wagmi with a custom 0G Galileo Testnet chain definition to handle chain switching automatically.

### 2. Chat with AI
Messages are sent to the 0G Compute Router, which routes them to a TEE-attested provider. Responses stream back in real time. The user sees "TEE Verified" confirmation on every message.

### 3. Save to 0G
Clicking "Save to 0G" triggers a two-phase commit:
- **Phase 1 (automatic):** The server encrypts and uploads to 0G Storage
- **Phase 2 (user-signed):** MetaMask prompts the user to record the proof on-chain

### 4. Verify
The "Explorer" link appears next to saved conversations, pointing directly to the on-chain transaction. Anyone can verify that the conversation was saved, when it was saved, and which model was used, without being able to read the actual content.

---

## Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, Next.js 16, Tailwind CSS 4 | Responsive chat UI |
| AI SDK | Vercel AI SDK v4 | Streaming, message management |
| Wallet | wagmi, viem | MetaMask integration, chain switching |
| AI Inference | 0G Compute Router | Decentralized TEE-attested LLM |
| Data Storage | 0G Storage SDK | Encrypted decentralized persistence |
| Smart Contract | Solidity 0.8.20 | On-chain proof registry |
| Blockchain | 0G Galileo Testnet (16602) | Settlement and verification layer |

---

## Deployed Contracts and Addresses

| Resource | Address / URL |
|---|---|
| PrivateChat Contract | [`0xc04d2D6f8AB14eB01f67b1e5Be5bf204c5AA2212`](https://chainscan-galileo.0g.ai/address/0xc04d2D6f8AB14eB01f67b1e5Be5bf204c5AA2212) |
| Deployer Wallet | [`0xf89540a95b7332199f36c77e3a0958Bd6F7e6341`](https://chainscan-galileo.0g.ai/address/0xf89540a95b7332199f36c77e3a0958Bd6F7e6341) |
| 0G Compute Router | `router-api-testnet.integratenetwork.work` |
| 0G Storage Indexer | `indexer-storage-testnet-turbo.0g.ai` |
| Chain Explorer | [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) |
| Storage Explorer | [storagescan-galileo.0g.ai](https://storagescan-galileo.0g.ai) |

---

## Getting Started

### Prerequisites
- Node.js 22+
- MetaMask with 0G Galileo Testnet configured
- 0G testnet tokens from the faucet

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/0g-private-chat.git
cd 0g-private-chat
npm install --legacy-peer-deps
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# 0G Compute Router
ZG_ROUTER_BASE_URL=https://router-api-testnet.integratenetwork.work/v1
ZG_ROUTER_API_KEY=your_0g_api_key

# 0G Storage
ZG_STORAGE_PRIVATE_KEY=your_private_key_for_storage
ZG_STORAGE_RPC=https://evmrpc-testnet.0g.ai
ZG_STORAGE_INDEXER=https://indexer-storage-testnet-turbo.0g.ai

# Smart Contract
NEXT_PUBLIC_ZG_PRIVATE_CHAT_CONTRACT=0xc04d2D6f8AB14eB01f67b1e5Be5bf204c5AA2212
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting.

### Deploy Contract (Optional)

The contract is already deployed at the address above. To deploy your own:

```bash
npx hardhat compile
npx tsx scripts/deploy.ts
```

---

## Project Structure

```
0g-private-chat/
  app/
    api/
      chat/route.ts          # 0G Compute Router integration
      storage/
        save/route.ts        # 0G Storage encrypted upload
        load/route.ts        # 0G Storage decryption and retrieval
    layout.tsx               # Root layout with wagmi providers
    providers.tsx             # WagmiProvider + QueryClientProvider
    page.tsx                  # Landing page
    chat/page.tsx             # Chat interface
  components/
    chat/
      chat-container.tsx     # Message stream and input
      chat-header.tsx        # Save to 0G + on-chain recording
    layout/
      sidebar.tsx            # Chat history + wallet connect
      connect-wallet.tsx     # MetaMask integration
  contracts/
    PrivateChat.sol          # On-chain proof registry
  lib/
    constants.ts             # App config and system prompt
    chat-store.tsx           # Zustand-style chat state
    wagmi-config.ts          # 0G Galileo chain definition
    contract-abi.ts          # PrivateChat ABI
    0g-config.ts             # Network configuration
  scripts/
    deploy.ts                # Contract deployment script
```

---

## What This Proves

**It is not a concept.** Every integration is live. The 0G Compute Router responds to real queries with TEE-attested inference. The 0G Storage network holds real encrypted chat data across decentralized nodes. The PrivateChat smart contract on the Galileo Testnet contains real, verifiable records of saved conversations.

**It solves a real problem.** The AI privacy crisis is not hypothetical. Every major AI company has faced data breach scandals, regulatory investigations, and user trust erosion. 0G Private Chat demonstrates that decentralized AI infrastructure can deliver the same user experience with fundamentally stronger privacy guarantees.

**It uses the full 0G stack.** This is not a project that uses one 0G feature and mocks the rest. It integrates 0G Compute for inference, 0G Storage for persistence, and 0G Chain for verification. These three layers work together to create a privacy architecture that no single-layer solution can match.

**It is production-ready.** The application handles real streaming responses, real encryption, real storage uploads, real MetaMask transactions, and real on-chain events. The user experience is polished: loading states, error handling, chain switching, and explorer links are all implemented.

The question is not whether decentralized AI is possible. 0G Private Chat proves that it is. The question is whether the world will adopt it fast enough.

---

## License

MIT
