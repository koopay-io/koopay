import { Keypair, Networks, Transaction } from "@stellar/stellar-sdk";

/**
 * Signs a Stellar transaction XDR with a secret key.
 *
 * This runs client-side — the secret key is held in the browser wallet
 * and never leaves the client.
 */
export const signTransactionWithSk = (
  unsignedTxXdr: string,
  secretKey: string,
): string => {
  const keypair = Keypair.fromSecret(secretKey);
  const transaction = new Transaction(unsignedTxXdr, Networks.TESTNET);
  transaction.sign(keypair);
  return transaction.toXDR();
};
