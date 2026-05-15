import { ethers } from "ethers";
import { readFileSync } from "fs";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
  const wallet = new ethers.Wallet(process.env.ZG_DEPLOYER_PRIVATE_KEY!, provider);

  console.log("Deploying to 0G MAINNET with account:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "0G");

  if (balance === 0n) {
    console.error("No balance! Fund this wallet first.");
    process.exit(1);
  }

  const artifact = JSON.parse(
    readFileSync("./artifacts/contracts/PrivateChat.sol/PrivateChat.json", "utf8")
  );

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log("Deploying PrivateChat...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ PrivateChat deployed to MAINNET:", address);
  console.log("Explorer:", `https://chainscan.0g.ai/address/${address}`);
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_ZG_PRIVATE_CHAT_CONTRACT_MAINNET=${address}`);
}

main().catch(console.error);
