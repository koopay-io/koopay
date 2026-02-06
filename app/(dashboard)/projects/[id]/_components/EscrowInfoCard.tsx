import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { truncateContractId } from '@/lib/utils/projectHelpers';

interface EscrowInfoCardProps {
  contractId: string;
  fundingStatus?: 'unfunded' | 'funding' | 'funded' | 'error';
  escrowUsdcBalance?: number | null;
  onViewDetails: () => void;
}

export function EscrowInfoCard({
  contractId,
  fundingStatus = 'unfunded',
  escrowUsdcBalance,
  onViewDetails,
}: EscrowInfoCardProps) {
  const statusLabel =
    fundingStatus === 'funded'
      ? 'Funded'
      : fundingStatus === 'funding'
        ? 'Funding'
        : fundingStatus === 'error'
          ? 'Error'
          : 'Unfunded';
  const statusClassName =
    fundingStatus === 'funded'
      ? 'bg-green-600'
      : fundingStatus === 'funding'
        ? 'bg-yellow-600'
        : fundingStatus === 'error'
          ? 'bg-red-600'
          : 'bg-gray-600';

  return (
    <Card className="bg-gray-900/50 border-gray-700 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                Escrow Disponible
              </h3>
              <Badge className={cn('text-white', statusClassName)}>
                {statusLabel}
              </Badge>
            </div>
            <p className="text-white/60 text-sm">
              Contract ID:{" "}
              <code className="text-green-400 font-mono text-xs">
                {truncateContractId(contractId)}
              </code>
            </p>
            {fundingStatus === 'funded' && (
              <p className="text-white/60 text-sm mt-1">
                Balance en escrow:{' '}
                <span className="text-white">
                  {(escrowUsdcBalance ?? 0).toLocaleString()} USDC
                </span>
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={onViewDetails}
            className="text-white hover:bg-white/20 hover:border-white/40 hover:text-white border-gray-600 transition-all"
          >
            Ver Detalles del Escrow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
