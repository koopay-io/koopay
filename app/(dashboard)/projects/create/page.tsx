// app/(dashboard)/projects/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check } from "lucide-react";
import { useProjectCreation } from "@/lib/hooks/useProjectCreation";
import { MilestoneEditModal } from "@/components/milestone-edit-modal";
import { CollaboratorAssignmentModal } from "@/components/collaborator-assignment-modal";
import { ProjectDetailsForm } from "./_components/project-details-form";
import { ProjectCollaborator } from "./_components/project-collaborator";
import { ProjectMilestones } from "./_components/project-milestones";

// Define Milestone types (can be moved to a types file)
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
  avatar_url?: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProjectWithEscrow, isLoading, error } = useProjectCreation();

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
      deadline: "2025-05-14",
      percentage: 50,
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

  // --- All Handlers remain in the parent component ---
  const handleBack = () => {
    router.back();
  };

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

  const handlePublishProject = async () => {
    if (
      !projectTitle ||
      !projectDescription ||
      !expectedDeliveryDate ||
      !acceptTerms ||
      !selectedCollaborator
    ) {
      // You can add more specific error handling here
      console.error("Validation failed");
      return;
    }

    const projectData = {
      title: projectTitle,
      description: projectDescription,
      total_amount: totalAmount,
      expected_delivery_date: expectedDeliveryDate,
      freelancer_id: selectedCollaborator.id, // Pass the ID
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        deadline: m.deadline,
      })),
    };

    const result = await createProjectWithEscrow(projectData);

    if (result.success && result.project) {
      router.push(`/projects/${result.project.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-8 text-foreground hover:bg-muted/50 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

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

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

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
              isLoading ||
              !projectTitle ||
              !projectDescription ||
              !expectedDeliveryDate ||
              !acceptTerms ||
              !selectedCollaborator
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg gap-2 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Project"}
            {!isLoading && <Check className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Modals remain here */}
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
    </div>
  );
}
