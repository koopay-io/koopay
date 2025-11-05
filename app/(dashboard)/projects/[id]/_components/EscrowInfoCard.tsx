import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { truncateContractId } from "@/lib/utils/projectHelpers";

interface EscrowInfoCardProps {
  contractId: string;
  projectId: string;
  onViewDetails: () => void;
}

export function EscrowInfoCard({ contractId, projectId, onViewDetails }: EscrowInfoCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-700 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Escrow Disponible</h3>
            <p className="text-white/60 text-sm">
              Contract ID:{" "}
              <code className="text-green-400 font-mono text-xs">
                {truncateContractId(contractId)}
              </code>
            </p>
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

