"use client"

interface ProjectProgressProps {
  milestones: Array<{ status: string }>;
}

export function ProjectProgress({ milestones }: ProjectProgressProps) {
  const calculateProgress = () => {
    if (!milestones.length) return 0;
    const completedMilestones = milestones.filter(m => m.status === 'completed');
    return Math.round((completedMilestones.length / milestones.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Progreso del proyecto:</h2>
        <span className="text-white font-medium">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div 
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
