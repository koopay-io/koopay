"use client";

import { useState, useEffect, useRef } from "react";
import { useGetEscrowFromIndexerByContractIds } from "@trustless-work/escrow";

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

interface EscrowDetails {
  contractId: string;
  escrow: MultiReleaseEscrow;
  balance?: Record<string, unknown>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch escrow details by contractId
 */
export const useEscrowDetails = (contractId: string | null | undefined) => {
  const [escrowData, setEscrowData] = useState<EscrowDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();
  const lastContractIdRef = useRef<string | null | undefined>(null);
  const isFetchingRef = useRef(false);

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

        // The response can be:
        // 1. An array of escrows directly: [{...}]
        // 2. An object with escrows array: { escrows: [...] }
        // 3. A single escrow object: { contractId: ..., ... }
        let escrowData = null;
        
        if (Array.isArray(response)) {
          // Case 1: Response is directly an array
          if (response.length > 0) {
            escrowData = response[0];
          }
        } else if (response && typeof response === 'object') {
          // Check if response has escrows array
          if ('escrows' in response && Array.isArray((response as { escrows: unknown[] }).escrows)) {
            const escrows = (response as { escrows: unknown[] }).escrows;
            if (escrows.length > 0) {
              escrowData = escrows[0];
            }
          } 
          // Check if response is directly the escrow object (has contractId or engagementId)
          else if ('contractId' in response || 'engagementId' in response) {
            escrowData = response;
          }
        }

        if (escrowData) {
          setEscrowData({
            contractId,
            escrow: escrowData as MultiReleaseEscrow,
            loading: false,
            error: null,
          });
        } else {
          setError("Escrow not found or not yet indexed");
          setEscrowData(null);
        }
      } catch (err) {
        console.error("❌ Error fetching escrow details:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch escrow details";
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
    refetch: () => {
      if (contractId) {
        const fetchEscrowDetails = async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await getEscrowByContractIds({
              contractIds: [contractId],
            });
            let escrowData = null;
            if (Array.isArray(response)) {
              // Response is directly an array
              if (response.length > 0) {
                escrowData = response[0];
              }
            } else if (response && typeof response === 'object') {
              if ('escrows' in response && Array.isArray((response as { escrows: unknown[] }).escrows)) {
                const escrows = (response as { escrows: unknown[] }).escrows;
                if (escrows.length > 0) {
                  escrowData = escrows[0];
                }
              } else if ('contractId' in response || 'engagementId' in response) {
                escrowData = response;
              }
            }
            if (escrowData) {
              setEscrowData({
                contractId,
                escrow: escrowData as MultiReleaseEscrow,
                loading: false,
                error: null,
              });
            }
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : "Failed to fetch escrow details";
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

