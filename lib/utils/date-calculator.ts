import { addHours, addDays, isWeekend, format } from "date-fns";

/**
 * Calculate due date based on start date, duration, and SLA
 * For MVP: Simple calculation (Mon-Fri working days, no holidays)
 */
export function calculateDueDate(
  startDate: Date,
  durationMinutes: number,
  slaHours: number
): Date {
  // Start with the start date
  let dueDate = new Date(startDate);
  
  // Add duration (work time)
  dueDate = addHours(dueDate, durationMinutes / 60);
  
  // Add SLA buffer
  dueDate = addHours(dueDate, slaHours);
  
  // Skip weekends (simple MVP approach)
  while (isWeekend(dueDate)) {
    dueDate = addDays(dueDate, 1);
  }
  
  return dueDate;
}

/**
 * Calculate time remaining until due date
 */
export function getTimeRemaining(dueDate: Date): {
  isOverdue: boolean;
  hours: number;
  days: number;
  formatted: string;
} {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  const isOverdue = diffMs < 0;
  const hours = Math.abs(diffHours % 24);
  const days = Math.abs(diffDays);
  
  let formatted = "";
  if (isOverdue) {
    formatted = `OVERDUE by ${days > 0 ? `${days}d ` : ""}${hours}h`;
  } else {
    formatted = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  }
  
  return { isOverdue, hours, days, formatted };
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM dd, yyyy h:mm a");
}

