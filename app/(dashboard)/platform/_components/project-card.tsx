'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Star } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  status: 'in_progress' | 'canceled' | 'done';
  collaborator: string;
  dateRange: string;
  milestones: number;
  totalPay: string;
  onViewProject?: () => void;
}

export function ProjectCard({
  title,
  status,
  collaborator,
  dateRange,
  milestones,
  totalPay,
  onViewProject,
}: ProjectCardProps) {
  const statusConfig = {
    in_progress: {
      color: 'text-primary',
      bgColor: 'bg-primary',
      label: 'In progress',
    },
    canceled: {
      color: 'text-destructive',
      bgColor: 'bg-destructive',
      label: 'Canceled',
    },
    done: {
      color: 'text-success',
      bgColor: 'bg-success',
      label: 'Done',
    },
  };

  const config = statusConfig[status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          <div className={`flex items-center gap-1 ${config.color}`}>
            <div className={`w-2 h-2 ${config.bgColor} rounded-full`}></div>
            <span className="text-xs sm:text-sm">{config.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Collaborated with {collaborator}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{dateRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Divided into {milestones} Milestones</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="font-semibold text-base sm:text-lg">Total Pay: {totalPay}</p>
          <Button
            className="w-full mt-3 text-sm sm:text-base bg-gradient-1"
            onClick={onViewProject}
          >
            View project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
