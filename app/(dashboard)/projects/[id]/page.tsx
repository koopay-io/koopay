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
import { FundEscrowCard } from "./_components/FundEscrowCard";
import { useMilestoneEvidence } from "@/lib/hooks/useMilestoneEvidence";
import { useEffect, useState } from "react";
import { EvidenceList } from "./_components/EvidenceList";
import { EvidenceUploadModal } from "@/components/EvidenceUploadModal";
import { PaymentTransactionCard } from "./_components/PaymentTransactionCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ProjectPage() {
	const params = useParams();
	const projectId = params.id as string;

	const {
		project,
		milestones,
		loading,
		currentMilestone,
		escrowContractId,
		escrowFundingStatus,
		escrowUsdcBalance,
		refetchEscrowDetails,
		milestoneCompleted,
		setMilestoneCompleted,
		handleViewContract,
		handleMilestoneApprove,
		handleMilestoneComplete,
		router,
		isApproving,
		approvalError,
		transactionHash,
		isContractor,
		isFreelancer,
		isMilestoneApproved,
		isMilestoneCompleted,
	} = useProjectPage(projectId);

	const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

	const {
		evidence,
		isLoading: isLoadingEvidence,
		fetchEvidence,
	} = useMilestoneEvidence();

	useEffect(() => {
		if (currentMilestone) {
			fetchEvidence(currentMilestone.id);
		}
	}, [currentMilestone, fetchEvidence]);

	if (loading) {
		return <LoadingState />;
	}

	if (!project) {
		return (
			<ErrorState message="El proyecto que buscas no existe o ha sido eliminado." />
		);
	}

	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-slate-950">
				{/* Top Navigation */}
				<header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => router.push("/dashboard")}
								className="text-slate-400 hover:text-white"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Volver
							</Button>
							<div className="h-4 w-px bg-slate-700" />
							<div className="flex items-center gap-2 text-sm text-slate-400">
								<Home className="h-4 w-4" />
								<span>/</span>
								<span>Proyectos</span>
								<span>/</span>
								<span className="text-white font-medium">
									{project.title}
								</span>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="space-y-8">
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
								onUploadEvidenceClick={() =>
									setIsEvidenceModalOpen(true)
								}
							/>
						</div>

						{/* Evidence */}
						<div className="mb-8">
							<h2 className="text-2xl font-bold text-white mb-6">
								Evidence
							</h2>
							<EvidenceList
								evidence={evidence}
								isLoading={isLoadingEvidence}
							/>
						</div>

						{/* Payment Details */}
						{(() => {
							const milestoneToShow =
								currentMilestone?.status === "completed"
									? currentMilestone
									: milestones
											.filter(
												(m) =>
													m.status === "completed" &&
													m.payment_hash,
											)
											.sort(
												(a, b) =>
													new Date(
														b.payment_sent_at || 0,
													).getTime() -
													new Date(
														a.payment_sent_at || 0,
													).getTime(),
											)[0];

							return milestoneToShow?.payment_hash &&
								project.freelancer_id ? (
								<div className="mb-8">
									<h2 className="text-2xl font-bold text-white mb-6">
										Payment Details
									</h2>
									<PaymentTransactionCard
										paymentHash={milestoneToShow.payment_hash}
										amount={
											project.total_amount *
											(milestoneToShow.percentage / 100)
										}
										recipient={project.freelancer_id}
										timestamp={
											milestoneToShow.payment_sent_at ?? null
										}
										status="success"
									/>
								</div>
							) : null;
						})()}

						{/* Milestones Timeline */}
						<MilestonesTimeline
							milestones={milestones}
							totalAmount={project.total_amount}
						/>

						{/* Project Progress */}
						<ProjectProgress milestones={milestones} />

						{/* Escrow */}
						{escrowContractId && project && (
							<>
								{escrowFundingStatus !== "funded" && (
									<FundEscrowCard
										contractId={escrowContractId}
										totalAmount={project.total_amount}
										fundingStatus={escrowFundingStatus}
										escrowUsdcBalance={escrowUsdcBalance}
										onFundingSuccess={refetchEscrowDetails}
									/>
								)}

								<EscrowInfoCard
									contractId={escrowContractId}
									projectId={projectId}
									fundingStatus={escrowFundingStatus}
									escrowUsdcBalance={escrowUsdcBalance}
									onViewDetails={() =>
										router.push(`/projects/${projectId}/test-escrow`)
									}
								/>
							</>
						)}

						{/* Save Changes / Actions Area */}
						<div className="flex flex-col items-end gap-4">
							{approvalError && (
								<div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-2 rounded text-sm">
									Error: {approvalError}
								</div>
							)}

							{transactionHash && (
								<div className="bg-emerald-950/40 border border-emerald-700 text-emerald-300 px-4 py-2 rounded text-sm flex items-center gap-2">
									<span>Stellar Transaction Hash:</span>
									<a
										href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
										target="_blank"
										rel="noopener noreferrer"
										className="underline font-mono text-xs hover:text-emerald-200"
									>
										{transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
									</a>
								</div>
							)}

							<div className="flex flex-wrap gap-4 items-center">
								<Button
									onClick={handleViewContract}
									variant="secondary"
									className="hover:brightness-110 hover:shadow-lg transition-all"
									disabled={isApproving}
								>
									<FileText className="h-5 w-5" />
									Ver Contrato
								</Button>

								{/* Role: Contractor */}
								{isContractor && (
									<Button
										onClick={handleMilestoneApprove}
										disabled={isMilestoneApproved || isApproving}
										className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 text-lg gap-2 disabled:opacity-50 transition-all"
									>
										{isApproving ? (
											<>
												<div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												Aprobando en Smart Contract...
											</>
										) : isMilestoneApproved ? (
											<>
												<Check className="h-5 w-5" />
												Hito Aprobado en Contrato
											</>
										) : (
											<>
												<Check className="h-5 w-5" />
												Aprobar Hito
											</>
										)}
									</Button>
								)}

								{/* Role: Freelancer */}
								{isFreelancer && (
									<Button
										onClick={handleMilestoneComplete}
										disabled={!isMilestoneApproved || isMilestoneCompleted || isApproving}
										className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 text-lg gap-2 disabled:opacity-50 transition-all"
									>
										{isApproving ? (
											<>
												<div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												Liberando Pago en Smart Contract...
											</>
										) : isMilestoneCompleted ? (
											<>
												<Check className="h-5 w-5" />
												Pago Liberado
											</>
										) : isMilestoneApproved ? (
											<>
												<Check className="h-5 w-5" />
												Marcar como Completado & Liberar Pago
											</>
										) : (
											<>
												Esperando Aprobación del Contratista
											</>
										)}
									</Button>
								)}

								{/* Fallback for general / unassigned view */}
								{!isContractor && !isFreelancer && (
									<Button
										onClick={handleMilestoneComplete}
										disabled={!milestoneCompleted || isApproving}
										className="bg-blue-500 hover:brightness-110 hover:shadow-lg text-white px-8 py-3 text-lg gap-2 disabled:opacity-50 transition-all"
									>
										{isApproving ? (
											<>
												<div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												Procesando en Smart Contract...
											</>
										) : (
											<>
												<Check className="h-5 w-5" />
												Guardar cambios
											</>
										)}
									</Button>
								)}
							</div>
						</div>
					</div>
				</main>

				{/* Evidence Upload Modal */}
				{currentMilestone && (
					<EvidenceUploadModal
						isOpen={isEvidenceModalOpen}
						onClose={() => setIsEvidenceModalOpen(false)}
						milestoneId={currentMilestone.id}
						onUploadSuccess={() => fetchEvidence(currentMilestone.id)}
					/>
				)}
			</div>
		</ErrorBoundary>
	);
}
