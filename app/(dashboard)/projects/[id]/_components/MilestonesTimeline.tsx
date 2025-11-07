import { Card, CardContent } from "@/components/ui/card";
import { CompletedMilestoneIcon } from "@/components/milestone-icons/CompletedMilestoneIcon";
import { PendingMilestoneIcon } from "@/components/milestone-icons/PendingMilestoneIcon";
import { getMilestoneAmount, formatCurrency } from "@/lib/utils/projectHelpers";
import { Database } from "@/lib/supabase/types/database.gen";

type Milestone = Database['public']['Tables']['milestones']['Row'];

interface MilestonesTimelineProps {
  milestones: Milestone[];
  totalAmount: number;
}

export function MilestonesTimeline({ milestones, totalAmount }: MilestonesTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                Este proyecto no tiene milestones
              </h3>
              <p className="text-white/80">
                Los milestones deben ser creados al momento de crear el proyecto.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Milestones are already ordered correctly by created_at from the database
  // No need to sort again - they come in the correct order from useProjectMilestones
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
      <div className="relative">
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-600"></div>
        <div className="flex justify-between items-start">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex flex-col items-center relative z-10"
            >
              <div className="w-16 h-16 mb-4">
                {milestone.status === "completed" ? (
                  <CompletedMilestoneIcon id={`completed-${milestone.id}`} />
                ) : (
                  <PendingMilestoneIcon />
                )}
              </div>
              <div className="text-center max-w-32">
                <h3 className="text-white text-sm font-medium mb-2 leading-tight">
                  {milestone.title}
                </h3>
                <p className="text-blue-400 text-sm font-semibold">
                  {formatCurrency(getMilestoneAmount(totalAmount, milestone.percentage))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

