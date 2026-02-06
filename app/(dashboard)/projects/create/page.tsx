"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useStellarWallet } from "@/lib/hooks/useStellarWallet";
import { signTransactionWithSk } from "@/lib/stellar/trustless";
import { toast } from "sonner";

// Components
import { MilestoneEditModal } from "@/components/MilestoneEditModal";
import { CollaboratorAssignmentModal } from "@/components/CollaboratorAssignmentModal";
import { ProjectDetailsForm } from "./_components/ProjectDetailsForm";
import { ProjectCollaborator } from "./_components/ProjectCollaborator";
import { ProjectMilestones } from "./_components/ProjectMilestones";

// Server Actions
import {
  prepareProjectCreation,
  finalizeProjectCreation,
} from "@/app/actions/project-actions";

// Types
import type { CreateProjectInput } from "@/lib/validations/project";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  percentage: number;
}

interface Collaborator {
  id: string;
  full_name: string;
  position: string;
  avatar_url: string | null;
  wallet_address?: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { wallet } = useStellarWallet();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-foreground hover:bg-muted/50 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <CreateProjectForm wallet={wallet} onBack={() => router.back()} />
      </div>
    </div>
  );
}

// This component handles all high-frequency updates (typing, slider)
interface CreateProjectFormProps {
  wallet: { publicKey: string; secretKey?: string } | null;
  onBack: () => void;
}

function CreateProjectForm({ wallet, onBack }: CreateProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState(8000);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "Hero section",
      description:
        "Create the wireframes and high quality mockup design of the hero section...",
      deadline: "2026-02-14",
      percentage: 100,
    },
  ]);

  // Modal State
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

  // Collaborator State
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<Collaborator | null>(null);

  // --- Handlers ---

  const handleAddMilestone = () => {
    setEditingMilestone(null);
    setIsMilestoneModalOpen(true);
  };

  const handleEditMilestone = (id: string) => {
    const milestone = milestones.find((m) => m.id === id);
    setEditingMilestone(milestone || null);
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (milestone: Milestone) => {
    if (editingMilestone) {
      setMilestones(
        milestones.map((m) => (m.id === milestone.id ? milestone : m)),
      );
    } else {
      setMilestones([
        ...milestones,
        { ...milestone, id: Date.now().toString() },
      ]);
    }
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSelectCollaborator = (freelancer: Collaborator) => {
    setSelectedCollaborator(freelancer);
  };

  const handlePublishProject = () => {
    if (!wallet?.publicKey || !wallet?.secretKey) {
      toast.error("Wallet not connected or missing secret key");
      return;
    }

    if (!selectedCollaborator) {
      toast.error("Please assign a collaborator");
      return;
    }

    const isManualCollaborator = selectedCollaborator.id === "manual";
    const manualAddress = selectedCollaborator.wallet_address?.trim() ?? "";

    if (isManualCollaborator && !manualAddress) {
      toast.error("Missing collaborator wallet address");
      return;
    }

    const payload: CreateProjectInput = {
      title: projectTitle,
      description: projectDescription,
      total_amount: totalAmount,
      expected_delivery_date: expectedDeliveryDate,
      freelancer_id: isManualCollaborator ? null : selectedCollaborator.id,
      freelancer_address: isManualCollaborator ? manualAddress : null,
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        deadline: m.deadline,
      })),
    };

    startTransition(async () => {
      try {
        // 1. Prepare (Server)
        toast.info("Preparing contract...");
        const prep = await prepareProjectCreation(payload, wallet.publicKey);

        if (!prep.success) {
          throw new Error(prep.error);
        }

        // 2. Sign (Client)
        toast.info("Signing transaction...");
        const signedXdr = signTransactionWithSk(
          prep.unsignedTransaction,
          wallet.secretKey!,
        );

        // 3. Finalize (Server)
        toast.info("Deploying to Stellar network...");
        const result = await finalizeProjectCreation(signedXdr, payload);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Project created successfully!");
        router.push(`/projects/${result.projectId}`);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create project";
        toast.error(message);
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            New Project
          </h1>

          <ProjectDetailsForm
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            expectedDeliveryDate={expectedDeliveryDate}
            setExpectedDeliveryDate={setExpectedDeliveryDate}
          />

          <ProjectCollaborator
            selectedCollaborator={selectedCollaborator}
            onOpenModal={() => setIsCollaboratorModalOpen(true)}
            onClearCollaborator={() => setSelectedCollaborator(null)}
          />
        </div>

        {/* Right Section */}
        <ProjectMilestones
          milestones={milestones}
          onAddMilestone={handleAddMilestone}
          onEditMilestone={handleEditMilestone}
        />
      </div>

      {/* Terms and Create Project Button */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm text-foreground cursor-pointer"
          >
            I accept the terms and conditions of the established contract
          </label>
        </div>

        <Button
          onClick={handlePublishProject}
          disabled={
            isPending ||
            !projectTitle ||
            !projectDescription ||
            !expectedDeliveryDate ||
            !acceptTerms ||
            !selectedCollaborator
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Create Project
              <Check className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Modals */}
      <MilestoneEditModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestone={editingMilestone}
        onSave={handleSaveMilestone}
        onDelete={handleDeleteMilestone}
      />

      <CollaboratorAssignmentModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        onSelect={handleSelectCollaborator}
        selectedFreelancer={selectedCollaborator}
      />
    </>
  );
}
