import { Keypair, Networks, Transaction } from "@stellar/stellar-sdk";

export const signTransactionWithSecretKey = (
  unsignedTxXdr: string,
  secretKey: string,
): string => {
  const keypair = Keypair.fromSecret(secretKey);
  const transaction = new Transaction(unsignedTxXdr, Networks.TESTNET);
  transaction.sign(keypair);
  return transaction.toXDR();
};
