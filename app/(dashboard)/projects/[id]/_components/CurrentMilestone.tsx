import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, Upload } from "lucide-react";
import { formatDate, getDaysLeft, getMilestoneAmount } from "@/lib/utils/projectHelpers";

interface Milestone {
  id: string;
  title: string;
  percentage: number;
}

interface CurrentMilestoneProps {
  milestone: Milestone | null;
  expectedDeliveryDate: string;
  totalAmount: number;
  milestoneCompleted: boolean;
  onMilestoneCompletedChange: (completed: boolean) => void;
}

export function CurrentMilestone({
  milestone,
  expectedDeliveryDate,
  totalAmount,
  milestoneCompleted,
  onMilestoneCompletedChange,
}: CurrentMilestoneProps) {
  if (!milestone) {
    return (
      <Card className="bg-blue-600 border-blue-500">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Current milestone:</h2>
          <div className="text-white/60">No hay hitos pendientes</div>
        </CardContent>
      </Card>
    );
  }

  const daysLeft = getDaysLeft(expectedDeliveryDate);
  const milestoneAmount = getMilestoneAmount(totalAmount, milestone.percentage);

  return (
    <Card className="bg-blue-600 border-blue-500">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Current milestone:</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-white" />
            <span className="text-white text-lg">{milestone.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-white/80" />
            <span className="text-white/80">
              Deadline: {formatDate(expectedDeliveryDate)}
            </span>
          </div>

          <div className="flex gap-4 mt-6">
            <Badge className="bg-white/20 text-white border-white/30">
              Receive for this milestone: {milestone.percentage}%
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              {daysLeft} days left
            </Badge>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={milestoneCompleted}
                onChange={(e) => onMilestoneCompletedChange(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-white/20 border-white/30 rounded focus:ring-blue-500"
              />
              <span className="text-white">Marcar hito como completado</span>
            </label>

            <Button className="w-full bg-white text-blue-600 hover:brightness-110 hover:shadow-lg gap-2 transition-all">
              <Upload className="h-4 w-4" />
              Subir evidencia
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

