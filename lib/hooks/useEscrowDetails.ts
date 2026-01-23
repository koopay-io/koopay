"use client";

import { useState, useEffect, useRef } from 'react';
import { useGetEscrowFromIndexerByContractIds } from '@trustless-work/escrow';

// Using a more specific type for escrow based on Trustless Work structure
// The escrow object from getEscrowByContractIds should have title, description, type, etc.
interface MultiReleaseEscrow {
  contractId?: string;
  title?: string;
  description?: string;
  type?: string;
  roles?: Record<string, unknown>;
  milestones?: unknown[];
  [key: string]: unknown; // Allow other properties
}

type FundingStatus = 'unfunded' | 'funding' | 'funded' | 'error';

interface EscrowBalanceSummary {
  assetCode: string;
  balance: number;
}

interface EscrowDetails {
  contractId: string;
  escrow: MultiReleaseEscrow;
  balances?: EscrowBalanceSummary[];
  usdcBalance?: number | null;
  fundingStatus?: FundingStatus;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch escrow details by contractId
 */
export const useEscrowDetails = (
  contractId: string | null | undefined,
  targetAmount?: number,
) => {
  const [escrowData, setEscrowData] = useState<EscrowDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();
  const lastContractIdRef = useRef<string | null | undefined>(null);
  const isFetchingRef = useRef(false);

  const parseBalanceEntries = (raw: unknown): EscrowBalanceSummary[] => {
    if (Array.isArray(raw)) {
      return raw.reduce<EscrowBalanceSummary[]>((acc, entry) => {
        if (entry && typeof entry === 'object') {
          const balanceEntry = entry as {
            asset_code?: unknown;
            assetCode?: unknown;
            balance?: unknown;
          };
          const assetCode =
            typeof balanceEntry.asset_code === 'string'
              ? balanceEntry.asset_code
              : typeof balanceEntry.assetCode === 'string'
                ? balanceEntry.assetCode
                : null;
          const balanceValue =
            typeof balanceEntry.balance === 'string' ||
            typeof balanceEntry.balance === 'number'
              ? Number(balanceEntry.balance)
              : NaN;
          if (assetCode && Number.isFinite(balanceValue)) {
            acc.push({
              assetCode,
              balance: balanceValue,
            });
          }
        }
        return acc;
      }, []);
    }

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return Object.entries(raw).reduce<EscrowBalanceSummary[]>(
        (acc, [assetCode, balance]) => {
          if (typeof balance === 'string' || typeof balance === 'number') {
            const balanceValue = Number(balance);
            if (Number.isFinite(balanceValue)) {
              acc.push({
                assetCode,
                balance: balanceValue,
              });
            }
          }
          return acc;
        },
        [],
      );
    }

    return [];
  };

  const getFundingStatus = (
    usdcBalance: number | null,
    totalAmount?: number,
  ): FundingStatus => {
    if (!usdcBalance || usdcBalance <= 0) {
      return 'unfunded';
    }
    if (typeof totalAmount === 'number') {
      return usdcBalance >= totalAmount ? 'funded' : 'funding';
    }
    return 'funding';
  };

  const resolveEscrowFromResponse = (response: unknown) => {
    let resolvedEscrow: MultiReleaseEscrow | null = null;

    if (Array.isArray(response)) {
      if (response.length > 0) {
        resolvedEscrow = response[0] as MultiReleaseEscrow;
      }
    } else if (response && typeof response === 'object') {
      if (
        'escrows' in response &&
        Array.isArray((response as { escrows?: unknown }).escrows)
      ) {
        const escrows = (response as { escrows: unknown[] }).escrows;
        if (escrows.length > 0) {
          resolvedEscrow = escrows[0] as MultiReleaseEscrow;
        }
      } else if ('contractId' in response || 'engagementId' in response) {
        resolvedEscrow = response as MultiReleaseEscrow;
      }
    }

    return resolvedEscrow;
  };

  const resolveBalances = (response: unknown, escrow: MultiReleaseEscrow) => {
    const responseBalance =
      response && typeof response === 'object'
        ? (response as { balance?: unknown; balances?: unknown }).balance ??
          (response as { balances?: unknown }).balances
        : null;
    const escrowBalance =
      escrow && typeof escrow === 'object'
        ? (escrow as { balance?: unknown; balances?: unknown }).balance ??
          (escrow as { balances?: unknown }).balances
        : null;

    const rawBalance = responseBalance ?? escrowBalance;
    return parseBalanceEntries(rawBalance);
  };

  useEffect(() => {
    // Skip if contractId hasn't changed or if we're already fetching
    if (contractId === lastContractIdRef.current || isFetchingRef.current) {
      return;
    }

    const fetchEscrowDetails = async () => {
      if (!contractId) {
        setEscrowData(null);
        setLoading(false);
        lastContractIdRef.current = contractId;
        return;
      }

      // Mark as fetching to prevent duplicate calls
      isFetchingRef.current = true;
      lastContractIdRef.current = contractId;
      setLoading(true);
      setError(null);

      try {
        const response = await getEscrowByContractIds({
          contractIds: [contractId],
        });

        const resolvedEscrow = resolveEscrowFromResponse(response);
        if (resolvedEscrow) {
          const balances = resolveBalances(response, resolvedEscrow);
          const usdcEntry =
            balances.find((entry) => entry.assetCode === 'USDC') || null;
          const usdcBalance = usdcEntry ? usdcEntry.balance : null;
          const fundingStatus = getFundingStatus(usdcBalance, targetAmount);

          setEscrowData({
            contractId,
            escrow: resolvedEscrow,
            balances,
            usdcBalance,
            fundingStatus,
            loading: false,
            error: null,
          });
        } else {
          setError('Escrow not found or not yet indexed');
          setEscrowData(null);
        }
      } catch (err) {
        console.error('❌ Error fetching escrow details:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch escrow details';
        setError(errorMessage);
        setEscrowData(null);
        // Don't throw - just set error state so UI can still render
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchEscrowDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]); // Only depend on contractId, not getEscrowByContractIds to avoid infinite loops

  return {
    escrowData,
    loading,
    error,
    fundingStatus: error
      ? 'error'
      : getFundingStatus(escrowData?.usdcBalance ?? null, targetAmount),
    usdcBalance: escrowData?.usdcBalance ?? null,
    refetch: () => {
      if (contractId) {
        const fetchEscrowDetails = async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await getEscrowByContractIds({
              contractIds: [contractId],
            });
            const resolvedEscrow = resolveEscrowFromResponse(response);
            if (resolvedEscrow) {
              const balances = resolveBalances(response, resolvedEscrow);
              const usdcEntry =
                balances.find((entry) => entry.assetCode === 'USDC') || null;
              const usdcBalance = usdcEntry ? usdcEntry.balance : null;
              const fundingStatus = getFundingStatus(usdcBalance, targetAmount);

              setEscrowData({
                contractId,
                escrow: resolvedEscrow,
                balances,
                usdcBalance,
                fundingStatus,
                loading: false,
                error: null,
              });
            } else {
              setError('Escrow not found or not yet indexed');
              setEscrowData(null);
            }
          } catch (err) {
            const errorMessage =
              err instanceof Error
                ? err.message
                : 'Failed to fetch escrow details';
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        };
        fetchEscrowDetails();
      }
    },
  };
};

