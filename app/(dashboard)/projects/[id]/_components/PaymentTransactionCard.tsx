"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getStellarExplorerUrl, truncateHash } from "@/lib/utils/stellar";
import { formatCurrency } from "@/lib/utils/projectHelpers";

interface PaymentTransactionCardProps {
  paymentHash: string | null;
  amount: number;
  recipient: string;
  timestamp: string | null;
}

export function PaymentTransactionCard({
  paymentHash,
  amount,
  recipient,
  timestamp,
}: PaymentTransactionCardProps) {
  const [copied, setCopied] = useState(false);

  if (!paymentHash) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <p className="text-white/60 text-center">
            No payment transaction recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymentHash);
    setCopied(true);
    toast.success("Transaction hash copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = getStellarExplorerUrl(paymentHash);

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Payment Details</h3>
          <Badge className="bg-green-600 text-white">Success</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/60 mb-1">Transaction Hash</p>
            <div className="flex items-center gap-2">
              <code className="text-white bg-black/30 px-3 py-1.5 rounded text-sm flex-1">
                {truncateHash(paymentHash)}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="text-white hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Amount</p>
              <p className="text-white font-semibold">{formatCurrency(amount)}</p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Recipient</p>
              <p className="text-white font-mono text-sm">
                {truncateHash(recipient, 6, 6)}
              </p>
            </div>
          </div>

          {timestamp && (
            <div>
              <p className="text-sm text-white/60 mb-1">Sent At</p>
              <p className="text-white">
                {new Date(timestamp).toLocaleString()}
              </p>
            </div>
          )}

          <Button
            onClick={() => window.open(explorerUrl, "_blank")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            View on Stellar Explorer
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
