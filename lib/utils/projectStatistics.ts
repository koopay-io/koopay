export type ProjectStatus = 'in_progress' | 'done' | 'canceled';

export interface ProjectData {
  status: ProjectStatus;
  totalPay: string;
}

export interface ProjectStatistics {
  totalProjects: number;
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  activePercentage: number;
  completedPercentage: number;
  cancelledPercentage: number;
  totalActiveAmount: number;
  totalPaidAmount: number;
  averageProjectValue: number;
}

export function calculateProjectStatistics(
  projects: ProjectData[]
): ProjectStatistics {
  if (!projects || projects.length === 0) {
    return {
      totalProjects: 0,
      activeCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      activePercentage: 0,
      completedPercentage: 0,
      cancelledPercentage: 0,
      totalActiveAmount: 0,
      totalPaidAmount: 0,
      averageProjectValue: 0,
    };
  }

  let activeCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let totalActiveAmount = 0;
  let totalPaidAmount = 0;
  let totalValue = 0;

  for (const project of projects) {
    const amount = parseFloat(project.totalPay.replace(/[^0-9.]/g, ''));
    totalValue += amount;

    switch (project.status) {
      case 'in_progress':
        activeCount++;
        totalActiveAmount += amount;
        break;
      case 'done':
        completedCount++;
        totalPaidAmount += amount;
        break;
      case 'canceled':
        cancelledCount++;
        break;
    }
  }

  const totalProjects = projects.length;
  const activePercentage =
    totalProjects > 0 ? Math.round((activeCount / totalProjects) * 100) : 0;
  const completedPercentage =
    totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;
  const cancelledPercentage =
    totalProjects > 0 ? Math.round((cancelledCount / totalProjects) * 100) : 0;

  return {
    totalProjects,
    activeCount,
    completedCount,
    cancelledCount,
    activePercentage,
    completedPercentage,
    cancelledPercentage,
    totalActiveAmount,
    totalPaidAmount,
    averageProjectValue:
      totalProjects === 0 ? 0 : totalValue / totalProjects,
  };
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

