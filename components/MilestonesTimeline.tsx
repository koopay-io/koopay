"use client";

import { Check, Star } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  percentage: number;
  status: "pending" | "in_progress" | "completed";
}

interface MilestonesTimelineProps {
  milestones: Milestone[];
  totalAmount: number;
}

export function MilestonesTimeline({
  milestones,
  totalAmount,
}: MilestonesTimelineProps) {
  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        );
      case "in_progress":
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Star className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 border-2 border-gray-600 rounded-full border-dashed"></div>
        );
    }
  };

  const getMilestoneAmount = (percentage: number) => {
    return Math.round(totalAmount * (percentage / 100));
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700"></div>

      {/* Milestones */}
      <div className="flex justify-between items-start">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="flex flex-col items-center relative z-10"
          >
            {getMilestoneStatusIcon(milestone.status)}
            <div className="mt-4 text-center max-w-32">
              <h3 className="text-white font-medium mb-2 text-sm leading-tight">
                {milestone.title}
              </h3>
              <p className="text-white/60 text-xs">
                ${getMilestoneAmount(milestone.percentage).toLocaleString()} USD
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
