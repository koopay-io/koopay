"use client";
import { useState } from "react";
import CreateProjectButton from "@/components/trusless/create-project-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MyProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(50);

  const projectData = {
    title,
    description,
    amount,
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
          <Label htmlFor="amount">Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        {/* Pass the state to the button component */}
        <CreateProjectButton projectData={projectData} />
      </div>
    </div>
  );
}
