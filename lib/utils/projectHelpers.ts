/**
 * Helper functions for project-related calculations and utilities
 */

/**
 * Calculate the number of days left until a deadline
 */
export function getDaysLeft(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculate project progress percentage based on completed milestones
 */
export function calculateProgress(milestones: Array<{ status: string | null }>): number {
  if (milestones.length === 0) return 0;
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  return Math.round((completedCount / milestones.length) * 100);
}

/**
 * Calculate milestone amount based on project total and percentage
 */
export function getMilestoneAmount(
  totalAmount: number,
  percentage: number
): number {
  return Math.round(totalAmount * (percentage / 100));
}

/**
 * Format amount as USD currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()} USD`;
}

/**
 * Extract escrow contract ID from project object
 */
export function getEscrowContractId(
  project: { contract_id?: string | null; contractId?: string | null } | null | undefined
): string | null {
  if (!project) return null;
  return (
    (project.contract_id as string | undefined) ||
    (project.contractId as string | undefined) ||
    null
  );
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, locale = "es-ES"): string {
  return new Date(dateString).toLocaleDateString(locale);
}

/**
 * Truncate contract ID for display
 */
export function truncateContractId(contractId: string, length = 16): string {
  return `${contractId.slice(0, length)}...`;
}

