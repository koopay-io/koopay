"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Copy, ExternalLink, Home } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useProjectMilestones } from "@/lib/hooks/useProjectMilestones";
import { useEscrowDetails } from "@/lib/hooks/useEscrowDetails";

export default function TestEscrowPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { project, loading } = useProjectMilestones(projectId);

  // Get contract ID from project - escrow contract ID
  const escrowContractId = 
    (project as { contract_id?: string; contractId?: string })?.contract_id ||
    (project as { contract_id?: string; contractId?: string })?.contractId ||
    null;

  const { escrowData, loading: escrowLoading, error: escrowError } = useEscrowDetails(
    escrowContractId
  );

  // Extract escrow fields safely - now with proper types from Trustless Work
  const escrowTitle: string | null = escrowData?.escrow?.title 
    ? (typeof escrowData.escrow.title === 'string' ? escrowData.escrow.title : String(escrowData.escrow.title))
    : null;
  
  const escrowDescription: string | null = escrowData?.escrow?.description
    ? (typeof escrowData.escrow.description === 'string' ? escrowData.escrow.description : String(escrowData.escrow.description))
    : null;
  
  const escrowType: string = escrowData?.escrow?.type
    ? (typeof escrowData.escrow.type === 'string' ? escrowData.escrow.type : String(escrowData.escrow.type))
    : "multi-release";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando proyecto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Proyecto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 hover:text-white gap-2 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Proyecto
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/platform")}
              className="text-white/60 hover:text-white hover:bg-white/10 gap-2 transition-all"
            >
              <Home className="h-4 w-4" />
              Go to Platform
            </Button>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Testeo de Escrow
            </h1>
            <p className="text-white/60">
              Página de prueba para visualizar y depurar los detalles del escrow del proyecto: <span className="text-white font-medium">{project.title}</span>
            </p>
          </div>

          {/* Project Info Card */}
          <Card className="bg-gray-900/50 border-gray-700 mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Información del Proyecto</h2>
              <div className="space-y-2 text-white/80">
                <p><span className="font-medium">ID:</span> {project.id}</p>
                <p><span className="font-medium">Título:</span> {project.title}</p>
                <p><span className="font-medium">Descripción:</span> {project.description}</p>
                <p><span className="font-medium">Monto Total:</span> ${project.total_amount.toLocaleString()} USD</p>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Details Section */}
          {escrowContractId ? (
            <div className="mb-8" id="escrow-details-section">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Detalles del Escrow
              </h2>
              
              {/* Show contract ID even while loading */}
              <div className="mb-4">
                <label className="text-white/60 text-sm mb-2 block">
                  Contract ID del Escrow
                </label>
                <div className="flex items-center gap-2">
                  <code className="bg-black/50 text-green-400 px-4 py-2 rounded text-sm font-mono flex-1">
                    {escrowContractId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(escrowContractId)}
                    className="text-white hover:bg-white/20 hover:text-white transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Soroban contracts (start with 'C') use /contract/ route
                      // Stellar accounts (start with 'G') use /account/ route
                      const isSorobanContract = escrowContractId.startsWith('C');
                      const explorerUrl = isSorobanContract
                        ? `https://stellar.expert/explorer/testnet/contract/${escrowContractId}`
                        : `https://stellar.expert/explorer/testnet/account/${escrowContractId}`;
                      window.open(explorerUrl, "_blank");
                    }}
                    className="text-white hover:bg-white/20 hover:border-white/40 hover:text-white border-gray-600 transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {escrowLoading ? (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8">
                    <div className="text-white/60">Cargando detalles del escrow...</div>
                  </CardContent>
                </Card>
              ) : escrowError ? (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="p-8">
                    <div className="text-red-400">
                      Error al cargar escrow: {escrowError}
                    </div>
                  </CardContent>
                </Card>
              ) : escrowData?.escrow ? (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8 space-y-6">

                    {/* Escrow Type */}
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">
                        Tipo de Escrow
                      </label>
                      <Badge className="bg-blue-600 text-white">
                        {escrowType}
                      </Badge>
                    </div>

                    {/* Escrow Title & Description */}
                    {escrowTitle !== null && (
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">
                          Título
                        </label>
                        <p className="text-white">{escrowTitle}</p>
                      </div>
                    )}

                    {escrowDescription !== null && (
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">
                          Descripción
                        </label>
                        <p className="text-white/80">{escrowDescription}</p>
                      </div>
                    )}

                    {/* Roles */}
                    {escrowData.escrow.roles && typeof escrowData.escrow.roles === 'object' && !Array.isArray(escrowData.escrow.roles) && (
                      <div>
                        <label className="text-white/60 text-sm mb-3 block">
                          Roles
                        </label>
                        <div className="space-y-2">
                          {Object.entries(escrowData.escrow.roles as Record<string, unknown>).map(([role, address]) => (
                            <div key={role} className="flex items-center justify-between">
                              <span className="text-white/80 capitalize">{role}:</span>
                              <code className="text-green-400 text-xs font-mono bg-black/50 px-2 py-1 rounded">
                                {String(address).slice(0, 8)}...{String(address).slice(-8)}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones from Escrow */}
                    {escrowData.escrow.milestones && Array.isArray(escrowData.escrow.milestones) && escrowData.escrow.milestones.length > 0 && (
                      <div>
                        <label className="text-white/60 text-sm mb-3 block">
                          Milestones del Escrow
                        </label>
                        <div className="space-y-3">
                          {(escrowData.escrow.milestones as Array<{ description?: string; amount?: number; status?: string }>).map((milestone: { description?: string; amount?: number; status?: string }, index: number) => (
                            <div
                              key={index}
                              className="bg-black/30 p-4 rounded border border-gray-700"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-white font-medium">
                                  {milestone.description || `Milestone ${index + 1}`}
                                </span>
                                <Badge className="bg-green-600 text-white">
                                  {milestone.amount} USDC
                                </Badge>
                              </div>
                              {milestone.status && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-2 border-gray-600 text-gray-300"
                                >
                                  Status: {milestone.status}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Raw Escrow Data (for debugging) */}
                    <div className="pt-4 border-t border-gray-700">
                      <label className="text-white/60 text-sm mb-3 block">
                        Datos Raw del Escrow (Debug)
                      </label>
                      <pre className="bg-black/50 text-green-400 p-4 rounded text-xs font-mono overflow-auto max-h-96">
                        {JSON.stringify(escrowData.escrow, null, 2)}
                      </pre>
                    </div>

                    {/* View on Stellar Explorer */}
                    <div className="pt-4 border-t border-gray-700">
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-white hover:bg-white/20 hover:border-white/40 hover:text-white transition-all"
                        onClick={() => {
                          // Soroban contracts (start with 'C') use /contract/ route
                          // Stellar accounts (start with 'G') use /account/ route
                          const isSorobanContract = escrowData.contractId.startsWith('C');
                          const explorerUrl = isSorobanContract
                            ? `https://stellar.expert/explorer/testnet/contract/${escrowData.contractId}`
                            : `https://stellar.expert/explorer/testnet/account/${escrowData.contractId}`;
                          window.open(explorerUrl, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver en Stellar Explorer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="text-white/60">
                        Los detalles completos del escrow aún no están disponibles. El escrow puede estar aún procesándose o indexándose.
                      </div>
                      <div className="pt-4 border-t border-gray-700">
                        <Button
                          variant="outline"
                          className="w-full border-gray-600 text-white hover:bg-white/20 hover:border-white/40 hover:text-white transition-all"
                          onClick={() => {
                            // Soroban contracts (start with 'C') use /contract/ route
                            // Stellar accounts (start with 'G') use /account/ route
                            const isSorobanContract = escrowContractId.startsWith('C');
                            const explorerUrl = isSorobanContract
                              ? `https://stellar.expert/explorer/testnet/contract/${escrowContractId}`
                              : `https://stellar.expert/explorer/testnet/account/${escrowContractId}`;
                            window.open(explorerUrl, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Escrow en Stellar Explorer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-yellow-900/20 border-yellow-700">
              <CardContent className="p-8">
                <div className="text-yellow-400">
                  Este proyecto no tiene un escrow asociado. El contract_id no está disponible.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

