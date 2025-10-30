"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Check, Edit, User } from "lucide-react";
import { useProjectCreation } from "@/lib/hooks/useProjectCreation";
import { MilestoneEditModal } from "@/components/milestone-edit-modal";
import { CollaboratorAssignmentModal } from "@/components/collaborator-assignment-modal";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  percentage: number;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProjectWithEscrow, isLoading, error } = useProjectCreation();

  // Project form state
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState(8000);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [assignedCollaborator, setAssignedCollaborator] = useState<
    string | null
  >(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null
  );
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<{
    id: string;
    full_name: string;
    position: string;
  } | null>(null);

  // Milestones state
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

  const handleBack = () => {
    router.back();
  };

  const handleAddMilestone = () => {
    console.log("handleAddMilestone called");
    setEditingMilestone(null);
    setIsMilestoneModalOpen(true);
    console.log("Modal should open for new milestone");
  };

  const handleEditMilestone = (id: string) => {
    const milestone = milestones.find((m) => m.id === id);
    setEditingMilestone(milestone || null);
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (milestone: Milestone) => {
    console.log("handleSaveMilestone called with:", milestone);
    console.log("editingMilestone:", editingMilestone);
    console.log("current milestones:", milestones);

    if (editingMilestone) {
      // Update existing milestone
      console.log("Updating existing milestone");
      setMilestones(
        milestones.map((m) => (m.id === milestone.id ? milestone : m))
      );
    } else {
      // Add new milestone
      console.log("Adding new milestone");
      const newMilestone = {
        ...milestone,
        id: Date.now().toString(),
      };
      console.log("New milestone to add:", newMilestone);
      setMilestones([...milestones, newMilestone]);
      console.log("Milestones after adding:", [...milestones, newMilestone]);
    }
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSelectCollaborator = (freelancer: {
    id: string;
    full_name: string;
    position: string;
  }) => {
    setSelectedCollaborator(freelancer);
    setAssignedCollaborator(freelancer.id);
  };

  const handlePublishProject = async () => {
    if (
      !projectTitle ||
      !projectDescription ||
      !expectedDeliveryDate ||
      !acceptTerms
    ) {
      console.log("Validation failed:", {
        projectTitle: !!projectTitle,
        projectDescription: !!projectDescription,
        expectedDeliveryDate: !!expectedDeliveryDate,
        acceptTerms,
      });
      return;
    }

    const projectData = {
      title: projectTitle,
      description: projectDescription,
      total_amount: totalAmount,
      expected_delivery_date: expectedDeliveryDate,
      freelancer_id: assignedCollaborator,
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        deadline: m.deadline,
      })),
    };

    console.log("Publishing project with data:", projectData);
    console.log("Milestones:", milestones);

    const result = await createProjectWithEscrow(projectData);

    console.log("Project creation result:", result);

    if (result.success && result.project) {
      router.push(`/projects/${result.project.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-8 text-foreground hover:bg-muted/50 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - New Project */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                New Project
              </h1>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Project Title
                </label>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Brief Description
                </label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                  className="bg-muted/50 border-border text-foreground resize-none"
                />
              </div>
            </div>

            {/* Budget Allocation */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Total money allocated to the collaborator:
                </label>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">
                      ${totalAmount.toLocaleString('en-US')} USD
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$100</span>
                      <span>$20,000</span>
                    </div>
                    <Slider
                      value={[totalAmount]}
                      onValueChange={(value) => setTotalAmount(value[0])}
                      min={100}
                      max={20000}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Expected Delivery Date
              </label>
              <Input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="bg-muted/50 border-border text-foreground"
              />
            </div>

            {/* Assign Collaborator */}
            <div>
              {selectedCollaborator ? (
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {selectedCollaborator.full_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedCollaborator.position}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCollaborator(null);
                        setAssignedCollaborator(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsCollaboratorModalOpen(true)}
                  className="w-full gap-2 border-border text-foreground hover:bg-muted/50 h-12"
                >
                  <span className="text-foreground">Assign Collaborator</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </Button>
              )}
            </div>
          </div>

          {/* Right Section - Define Milestones */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Define Milestones
              </h2>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <Card key={milestone.id} className="bg-muted/30 border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-foreground">
                        {milestone.title || "Untitled Milestone"}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMilestone(milestone.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {milestone.description || "No description provided"}
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Deadline: {formatDate(milestone.deadline)}</div>
                      <div>Percent of total: {milestone.percentage}%</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Milestone Button */}
            <Button
              variant="outline"
              onClick={handleAddMilestone}
              className="w-full gap-2 border-border text-foreground hover:bg-muted/50"
            >
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>
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
              !acceptTerms
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg gap-2 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Project"}
            {!isLoading && <Check className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Milestone Edit Modal */}
      <MilestoneEditModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestone={editingMilestone}
        onSave={handleSaveMilestone}
        onDelete={handleDeleteMilestone}
      />

      {/* Collaborator Assignment Modal */}
      <CollaboratorAssignmentModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        onSelect={handleSelectCollaborator}
        selectedFreelancer={selectedCollaborator}
      />
    </div>
  );
}
