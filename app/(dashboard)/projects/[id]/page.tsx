"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, FileText, Home } from "lucide-react";
import { useParams } from "next/navigation";
import { useProjectPage } from "@/lib/hooks/useProjectPage";
import { LoadingState } from "./_components/LoadingState";
import { ErrorState } from "./_components/ErrorState";
import { ProjectOverview } from "./_components/ProjectOverview";
import { CurrentMilestone } from "./_components/CurrentMilestone";
import { MilestonesTimeline } from "./_components/MilestonesTimeline";
import { ProjectProgress } from "./_components/ProjectProgress";
import { EscrowInfoCard } from "./_components/EscrowInfoCard";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    project,
    milestones,
    loading,
    currentMilestone,
    escrowContractId,
    milestoneCompleted,
    setMilestoneCompleted,
    handleViewContract,
    handleMilestoneComplete,
    router,
    isApproving,
    approvalError,
  } = useProjectPage(projectId);

  if (loading) {
    return <LoadingState />;
  }

  if (!project) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
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
            Back
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

          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <ProjectOverview
              title={project.title}
              description={project.description}
              totalAmount={project.total_amount}
            />
            <CurrentMilestone
              milestone={currentMilestone}
              expectedDeliveryDate={project.expected_delivery_date}
              totalAmount={project.total_amount}
              milestoneCompleted={milestoneCompleted}
              onMilestoneCompletedChange={setMilestoneCompleted}
            />
          </div>

          {/* Milestones Timeline */}
          <MilestonesTimeline milestones={milestones} totalAmount={project.total_amount} />

          {/* Project Progress */}
          <ProjectProgress milestones={milestones} />

          {/* Quick Escrow Info - Link to test page */}
          {escrowContractId && (
            <EscrowInfoCard
              contractId={escrowContractId}
              projectId={projectId}
              onViewDetails={() => router.push(`/projects/${projectId}/test-escrow`)}
            />
          )}

          {/* Save Changes Button */}
          <div className="flex flex-col items-end gap-4">
            {approvalError && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-2 rounded text-sm">
                Error: {approvalError}
              </div>
            )}
            <div className="flex gap-4">
            <Button 
              onClick={handleViewContract} 
              variant="secondary"
              className="hover:brightness-110 hover:shadow-lg transition-all"
                disabled={isApproving}
            >
              <FileText className="h-5 w-5" />
              Ver Contrato
            </Button>
            <Button
              onClick={handleMilestoneComplete}
                disabled={!milestoneCompleted || isApproving}
              className="bg-blue-500 hover:brightness-110 hover:shadow-lg text-white px-8 py-3 text-lg gap-2 disabled:opacity-50 transition-all"
            >
                {isApproving ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Aprobando en Smart Contract...
                  </>
                ) : (
                  <>
              <Check className="h-5 w-5" />
              Guardar cambios
                  </>
                )}
            </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
