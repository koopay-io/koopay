'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStellarWallet } from '@/lib/hooks/useStellarWallet';
import { Wallet, Copy, Send, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function WalletSection() {
  const { wallet, balance, isLoading, error, refreshBalance, sendPayment } = useStellarWallet();
  const [showSecret, setShowSecret] = useState(false);
  const [sendDestination, setSendDestination] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleSendPayment = async () => {
    if (!sendDestination || !sendAmount) return;
    
    setIsSending(true);
    try {
      const txHash = await sendPayment(sendDestination, sendAmount);
      if (txHash) {
        setSendDestination('');
        setSendAmount('');
        // You could add a success toast here
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Stellar Wallet
          </CardTitle>
          <CardDescription>
            No wallet found. Please log in with Google to create your invisible wallet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Stellar Wallet
          </CardTitle>
          <CardDescription>
            Your invisible wallet created automatically with Google login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Public Key */}
          <div>
            <Label className="text-sm font-medium">Public Address</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {wallet.publicKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(wallet.publicKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Secret Key (Hidden by default) */}
          <div>
            <Label className="text-sm font-medium">Secret Key</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                {showSecret ? wallet.secretKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(wallet.secretKey || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Auth Method */}
          <div>
            <Label className="text-sm font-medium">Authentication Method</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="capitalize">
                {wallet.authMethod}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Balance
            <Button
              variant="outline"
              size="sm"
              onClick={refreshBalance}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading balance...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : balance.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No balance found. Account may not be funded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {balance.map((bal, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{bal.asset}</span>
                  <span className="font-mono">{bal.balance}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Payment
          </CardTitle>
          <CardDescription>
            Send XLM to another Stellar address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="destination">Destination Address</Label>
            <Input
              id="destination"
              placeholder="Enter Stellar address..."
              value={sendDestination}
              onChange={(e) => setSendDestination(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (XLM)</Label>
            <Input
              id="amount"
              type="number"
              step="0.0000001"
              placeholder="0.0000001"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSendPayment}
            disabled={!sendDestination || !sendAmount || isSending}
            className="w-full"
          >
            {isSending ? 'Sending...' : 'Send Payment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
