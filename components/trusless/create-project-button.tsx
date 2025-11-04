"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStellarWallet } from "@/lib/hooks/useStellarWallet";
import {
  createEscrow,
  ProjectData,
  signTransactionWithSk,
} from "@/lib/stellar/trustless";
import { http } from "@/lib/stellar/http";

export default function CreateProjectButton({
  projectData,
}: {
  projectData: ProjectData;
}) {
  const { wallet } = useStellarWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProject = async () => {
    if (!wallet) return;
    setIsLoading(true);

    const result = await createEscrow(wallet, projectData);
    const unsignedTx = result.unsignedTransaction;

    console.log("Escrow created successfully:", unsignedTx);
    setIsLoading(false);

    console.log("wallet sk: ", wallet.secretKey);
    const signedTxXdr = signTransactionWithSk(unsignedTx, wallet.secretKey!);

    // Send the transaction to Stellar Network
    const tx = await http.post("/helper/send-transaction", {
      signedXdr: signedTxXdr,
    });

    const { data } = tx;
    setIsLoading(false);
    alert(`Project Created! Transaction: ${data.hash}`); // Simple success feedback
    return data;
  };

  return (
    <Button onClick={handleCreateProject} disabled={isLoading || !wallet}>
      {isLoading ? "Creating..." : "Create Project & Escrow"}
    </Button>
  );
}
