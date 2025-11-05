import { calculateProgress } from "@/lib/utils/project-helpers";

interface Milestone {
  status: string;
}

interface ProjectProgressProps {
  milestones: Milestone[];
}

export function ProjectProgress({ milestones }: ProjectProgressProps) {
  const progress = calculateProgress(milestones);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-white text-lg">Progreso del proyecto:</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-white text-lg">{progress}%</span>
      </div>
    </div>
  );
}

