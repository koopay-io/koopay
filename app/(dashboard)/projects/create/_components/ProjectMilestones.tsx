"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus } from "lucide-react";

// Define the props
interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  percentage: number;
}

interface ProjectMilestonesProps {
  milestones: Milestone[];
  onAddMilestone: () => void;
  onEditMilestone: (id: string) => void;
}

// Utility to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export function ProjectMilestones({
  milestones,
  onAddMilestone,
  onEditMilestone,
}: ProjectMilestonesProps) {
  return (
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
                  onClick={() => onEditMilestone(milestone.id)}
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
        onClick={onAddMilestone}
        className="w-full gap-2 border-border text-foreground hover:bg-muted/50"
      >
        <Plus className="h-4 w-4" />
        Add Milestone
      </Button>
    </div>
  );
}
