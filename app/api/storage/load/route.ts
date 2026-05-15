import { NextResponse } from "next/server";

/**
 * POST /api/storage/load
 *
 * Downloads and decrypts chat data from 0G Storage using a Merkle root hash.
 * Uses the same deterministic encryption key as the save route.
 *
 * Body: { rootHash: string, chatId: string }
 * Returns: { data: { chatId, title, messages, savedAt, app } }
 */

export async function POST(req: Request) {
  try {
    const { rootHash, chatId } = await req.json();

    if (!rootHash || !chatId) {
      return NextResponse.json(
        { error: "Missing rootHash or chatId" },
        { status: 400 }
      );
    }

    const privateKey = process.env.ZG_STORAGE_PRIVATE_KEY;
    const indexerUrl =
      process.env.ZG_STORAGE_INDEXER ||
      "https://indexer-storage-testnet-turbo.0g.ai";

    if (!privateKey) {
      return NextResponse.json(
        { error: "Storage not configured: missing ZG_STORAGE_PRIVATE_KEY" },
        { status: 503 }
      );
    }

    const { Indexer } = await import("@0gfoundation/0g-storage-ts-sdk");
    const { ethers } = await import("ethers");

    const indexer = new Indexer(indexerUrl);

    // Recreate the same deterministic encryption key
    const keyMaterial = ethers.solidityPackedKeccak256(
      ["string", "string"],
      [privateKey, chatId]
    );
    const symmetricKey = Buffer.from(keyMaterial.slice(2), "hex");

    console.log(`[0G Storage] Downloading chat ${chatId}, root: ${rootHash}`);

    // Download + decrypt using the SDK's built-in decryption
    const [blob, dlErr] = await indexer.downloadToBlob(rootHash, {
      proof: true,
      decryption: { symmetricKey },
    });

    if (dlErr !== null) {
      console.error("Download error:", dlErr);
      return NextResponse.json(
        { error: `Download failed: ${dlErr}` },
        { status: 500 }
      );
    }

    // Parse the decrypted blob back to JSON
    const text = await blob.text();
    const data = JSON.parse(text);

    console.log(`[0G Storage] Download success for chat ${chatId}`);

    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error("[0G Storage] Load error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
