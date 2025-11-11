import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateRange = (start: string | null, end: string): string => {
  const startDate = new Date(start || Date.now()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const endDate = new Date(end).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  return `From ${startDate} to ${endDate}`;
};

export const formatTotalPay = (amount: number): string => {
  return `$${amount.toLocaleString("en-US")}USD`;
};
