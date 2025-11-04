'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowUpRight } from 'lucide-react';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: string;
  amount: string;
  onDestinationChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}

export function WithdrawDialog({
  open,
  onOpenChange,
  destination,
  amount,
  onDestinationChange,
  onAmountChange,
  onWithdraw,
  isWithdrawing,
}: WithdrawDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <ArrowUpRight className="h-5 w-5" />
          <span className="text-xs sm:text-sm">Withdraw</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>Send XLM to another Stellar address</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="withdraw-destination">Destination Address</Label>
            <Input
              id="withdraw-destination"
              placeholder="Enter Stellar address..."
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="withdraw-amount">Amount (XLM)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              step="0.0000001"
              placeholder="0.0000001"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button
            onClick={onWithdraw}
            disabled={!destination || !amount || isWithdrawing}
            className="w-full"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

