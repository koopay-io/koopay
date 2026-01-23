import { STELLAR_NETWORK } from "@/lib/constants";

export function getStellarExplorerUrl(txHash: string): string {
  const network = STELLAR_NETWORK === "testnet" ? "testnet" : "public";
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}

export function truncateHash(hash: string, startChars = 8, endChars = 8): string {
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

export function extractTransactionHash(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  
  // Check common response formats from Stellar SDK
  const response = result as Record<string, unknown>;
  
  if (typeof response.hash === "string") return response.hash;
  if (typeof response.id === "string") return response.id;
  if (typeof response.transactionHash === "string") return response.transactionHash;
  
  return null;
}
