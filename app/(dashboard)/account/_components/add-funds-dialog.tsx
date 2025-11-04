'use client';

import { QRCodeSVG } from 'qrcode.react';
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
import { Copy, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';

interface AddFundsDialogProps {
  publicKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundsDialog({ publicKey, open, onOpenChange }: AddFundsDialogProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <Plus className="h-5 w-5" />
          <span className="text-xs sm:text-sm">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Send XLM from an external wallet to your public address on Stellar testnet
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border">
            <QRCodeSVG
              value={publicKey}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#ffffff"
              bgColor="#16132c"
            />
          </div>
          <div>
            <Label>Your Public Address</Label>
            <div className="flex gap-2 mt-2">
              <Input value={publicKey} readOnly className="flex-1 font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(publicKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg flex gap-3">
            <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">To start using this wallet:</p>
              <p>Send at least 1 XLM from an external wallet to the address above on Stellar testnet.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

