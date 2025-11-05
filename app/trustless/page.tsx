"use client";
import { useState } from "react";
import CreateProjectButton from "@/components/trusless/CreateProjectButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MyProjectPage() {
  const [title, setTitle] = useState("Simple Test Project");
  const [description, setDescription] = useState(
    "One milestone, 100% payment.",
  );
  const [totalAmount, setTotalAmount] = useState(50);
  const [collaboratorPublicKey, setCollaboratorPublicKey] = useState("");

  const projectData = {
    title,
    description,
    total_amount: totalAmount,
    milestones: [
      {
        title: "Project Completion",
        description: "Full payment upon completion",
        percentage: 100,
        deadline: "2025-12-31", // Placeholder deadline
      },
    ],
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-8">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center">
          Create a Simple Project
        </h1>

        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            placeholder="E.g., New Landing Page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="A brief description of the project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Total Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collaborator">Collaborator Public Key</Label>
          <Input
            id="collaborator"
            placeholder="G..."
            value={collaboratorPublicKey}
            onChange={(e) => setCollaboratorPublicKey(e.target.value)}
          />
        </div>

        <CreateProjectButton
          projectData={projectData}
          collaboratorPublicKey={collaboratorPublicKey}
        />
      </div>
    </div>
  );
}
