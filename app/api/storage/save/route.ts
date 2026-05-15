import { NextResponse } from "next/server";

/**
 * POST /api/storage/save
 *
 * Encrypts chat data with AES-256 (via 0G SDK built-in encryption)
 * and uploads it to 0G Storage. Returns the Merkle root hash for
 * on-chain indexing via PrivateChat.sol.
 *
 * Body: { chatId: string, messages: Message[], title: string }
 * Returns: { rootHash: string, txHash: string }
 *
 * NOTE: Uses MemData for in-memory upload (no temp files needed).
 * The encryption key is derived from the server-side storage private key.
 */

export async function POST(req: Request) {
  try {
    const { chatId, messages, title } = await req.json();

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing chatId or messages" },
        { status: 400 }
      );
    }

    const privateKey = process.env.ZG_STORAGE_PRIVATE_KEY;
    const rpcUrl = process.env.ZG_STORAGE_RPC || "https://evmrpc-testnet.0g.ai";
    const indexerUrl =
      process.env.ZG_STORAGE_INDEXER ||
      "https://indexer-storage-testnet-turbo.0g.ai";

    if (!privateKey) {
      return NextResponse.json(
        { error: "Storage not configured: missing ZG_STORAGE_PRIVATE_KEY" },
        { status: 503 }
      );
    }

    // Dynamic import to avoid loading heavy SDK at module level
    const { Indexer, MemData } = await import(
      "@0gfoundation/0g-storage-ts-sdk"
    );
    const { ethers } = await import("ethers");

    // Prepare chat data as JSON blob
    const chatData = JSON.stringify({
      chatId,
      title,
      messages,
      savedAt: new Date().toISOString(),
      app: "0g-private-chat",
    });

    // Create signer and indexer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const indexer = new Indexer(indexerUrl);

    // Generate a deterministic encryption key from private key + chatId
    // This way the same chat always uses the same key
    const keyMaterial = ethers.solidityPackedKeccak256(
      ["string", "string"],
      [privateKey, chatId]
    );
    const encryptionKey = Buffer.from(keyMaterial.slice(2), "hex"); // 32 bytes

    // Upload with built-in AES-256 encryption
    const data = new TextEncoder().encode(chatData);
    const memData = new MemData(data);
    const [tree, treeErr] = await memData.merkleTree();

    if (treeErr !== null) {
      console.error("Merkle tree error:", treeErr);
      return NextResponse.json(
        { error: "Failed to compute merkle tree" },
        { status: 500 }
      );
    }

    console.log(`[0G Storage] Uploading chat ${chatId}, root: ${tree?.rootHash()}`);

    const [tx, uploadErr] = await indexer.upload(memData, rpcUrl, signer, {
      encryption: { type: "aes256", key: encryptionKey },
    });

    if (uploadErr !== null) {
      console.error("Upload error:", uploadErr);
      return NextResponse.json(
        { error: `Upload failed: ${uploadErr}` },
        { status: 500 }
      );
    }

    // Handle response — single file upload returns rootHash/txHash
    const rootHash = "rootHash" in tx ? tx.rootHash : tx.rootHashes?.[0];
    const txHash = "txHash" in tx ? tx.txHash : tx.txHashes?.[0];

    console.log(`[0G Storage] Upload success! root=${rootHash} tx=${txHash}`);

    // Also compute content hash for on-chain record
    const contentHash = ethers.keccak256(new TextEncoder().encode(chatData));

    return NextResponse.json({
      rootHash,
      txHash,
      contentHash,
      chatId,
    });
  } catch (error: unknown) {
    console.error("[0G Storage] Save error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
