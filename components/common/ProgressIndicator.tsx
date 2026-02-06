interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({ currentStep, totalSteps, className = "" }: ProgressIndicatorProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Current step number */}
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-semibold">{currentStep}</span>
      </div>
      
      {/* Progress lines */}
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`h-1 w-8 rounded-full ${
              index < currentStep 
                ? 'bg-blue-500' 
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
