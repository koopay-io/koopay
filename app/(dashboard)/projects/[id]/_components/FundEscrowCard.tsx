'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStellarWallet } from '@/lib/hooks/useStellarWallet';
import { useEscrowWithSecretKey } from '@/lib/hooks/useEscrowWithSecretKey';
import { cn } from '@/lib/utils';
import type { FundEscrowPayload } from '@trustless-work/escrow/types';

type FundingStatus = 'unfunded' | 'funding' | 'funded' | 'error';

interface FundEscrowCardProps {
  contractId: string;
  totalAmount: number;
  fundingStatus: FundingStatus;
  escrowUsdcBalance?: number | null;
  onFundingSuccess?: () => void;
}

const HELP_LINK =
  'https://docs.trustlesswork.com/trustless-work/open-source-dapps/dapp-overview/step-4-funding-an-escrow';

export function FundEscrowCard({
  contractId,
  totalAmount,
  fundingStatus,
  escrowUsdcBalance,
  onFundingSuccess,
}: FundEscrowCardProps) {
  const { wallet, balance, refreshBalance } = useStellarWallet();
  const { fundMultiReleaseEscrow } = useEscrowWithSecretKey();
  const [isFunding, setIsFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  const contractorUsdcBalance = useMemo(() => {
    const usdcEntry = balance.find((entry) => entry.asset === 'USDC');
    const parsedBalance = usdcEntry ? Number(usdcEntry.balance) : 0;
    return Number.isFinite(parsedBalance) ? parsedBalance : 0;
  }, [balance]);

  const hasWallet = Boolean(wallet?.publicKey && wallet?.secretKey);
  const isFunded = fundingStatus === 'funded' || fundingSuccess;
  const isInsufficientBalance =
    totalAmount > 0 && contractorUsdcBalance < totalAmount;
  const isActionDisabled =
    isFunding || isFunded || isInsufficientBalance || !hasWallet;

  const handleFundEscrow = async () => {
    if (!wallet?.publicKey || !wallet?.secretKey) {
      setFundingError('Wallet no disponible. Inicia sesión de nuevo.');
      return;
    }

    setFundingError(null);
    setFundingSuccess(false);
    setIsFunding(true);

    try {
      const payload: FundEscrowPayload = {
        amount: totalAmount,
        contractId,
        signer: wallet.publicKey,
      };

      const result = await fundMultiReleaseEscrow(payload, wallet.secretKey);

      if (result && typeof result === 'object') {
        const status = (result as { status?: string }).status;
        if (status === 'ERROR') {
          const message =
            (result as { message?: string }).message ||
            'No se pudo fondear el escrow.';
          throw new Error(message);
        }
      }

      setFundingSuccess(true);
      await refreshBalance();
      // Delay before refetching escrow to give indexer time to update
      await new Promise((resolve) => setTimeout(resolve, 3000));
      onFundingSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al fondear el escrow.';
      setFundingError(message);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 mb-8">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Fondear Escrow del Proyecto
            </h3>
            <p className="text-white/60 text-sm">
              Contract ID:{' '}
              <code className="text-green-400 font-mono text-xs">
                {contractId}
              </code>
            </p>
          </div>
          <Badge
            className={cn(
              'text-white',
              isFunded ? 'bg-green-600' : 'bg-yellow-600',
            )}
          >
            {isFunded ? 'Funded' : 'Unfunded'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-black/40 p-4">
            <p className="text-sm text-white/60">Monto del proyecto</p>
            <p className="text-xl font-semibold text-white">
              {totalAmount.toLocaleString()} USDC
            </p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-black/40 p-4">
            <p className="text-sm text-white/60">Tu balance USDC</p>
            <p className="text-xl font-semibold text-white">
              {contractorUsdcBalance.toLocaleString()} USDC
            </p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-black/40 p-4">
            <p className="text-sm text-white/60">Balance del escrow</p>
            <p className="text-xl font-semibold text-white">
              {(escrowUsdcBalance ?? 0).toLocaleString()} USDC
            </p>
          </div>
        </div>

        {isInsufficientBalance && (
          <div className="rounded-lg border border-yellow-700 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-200">
            Tu balance USDC no es suficiente para fondear este escrow.
          </div>
        )}

        {!hasWallet && (
          <div className="rounded-lg border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            Tu wallet no está disponible. Inicia sesión de nuevo para fondear.
          </div>
        )}

        {fundingError && (
          <div className="rounded-lg border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {fundingError}
          </div>
        )}

        {fundingSuccess && (
          <div className="rounded-lg border border-green-700 bg-green-900/20 px-4 py-3 text-sm text-green-200">
            Escrow fondeado correctamente.
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <a
            href={HELP_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            ¿Cómo fondear un escrow con Trustless Work?
          </a>
          <Button
            onClick={handleFundEscrow}
            disabled={isActionDisabled}
            className="bg-blue-500 text-white hover:brightness-110 hover:shadow-lg disabled:opacity-50"
          >
            {isFunding ? 'Fondeando...' : 'Fund Escrow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
