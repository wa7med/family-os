import { differenceInDays, parseISO, subDays, format, isAfter, isBefore, isToday } from "date-fns";

export interface DeadlineInfo {
  cancelBefore: string;
  daysUntilCancel: number;
  urgency: "overdue" | "critical" | "warning" | "ok";
  label: string;
}

export function computeCancelDeadline(endDate: string, noticePeriodDays: number): string {
  const end = parseISO(endDate);
  const cancelDate = subDays(end, noticePeriodDays);
  return format(cancelDate, "yyyy-MM-dd");
}

export function getDeadlineInfo(endDate: string, noticePeriodDays: number): DeadlineInfo {
  const cancelBefore = computeCancelDeadline(endDate, noticePeriodDays);
  const cancelDate = parseISO(cancelBefore);
  const today = new Date();
  const daysUntilCancel = differenceInDays(cancelDate, today);

  let urgency: DeadlineInfo["urgency"];
  let label: string;

  if (isBefore(cancelDate, today) && !isToday(cancelDate)) {
    urgency = "overdue";
    label = `Cancellation deadline passed ${Math.abs(daysUntilCancel)} days ago`;
  } else if (daysUntilCancel <= 7) {
    urgency = "critical";
    label = daysUntilCancel === 0
      ? "Cancel TODAY!"
      : `Cancel within ${daysUntilCancel} day${daysUntilCancel === 1 ? "" : "s"}`;
  } else if (daysUntilCancel <= 30) {
    urgency = "warning";
    label = `Cancel before ${format(cancelDate, "dd MMM yyyy")} (${daysUntilCancel} days)`;
  } else {
    urgency = "ok";
    label = `Cancel before ${format(cancelDate, "dd MMM yyyy")}`;
  }

  return { cancelBefore, daysUntilCancel, urgency, label };
}

export function getContractStatus(endDate: string | null): "active" | "expiring" | "expired" {
  if (!endDate) return "active";
  const end = parseISO(endDate);
  const today = new Date();

  if (isBefore(end, today)) return "expired";
  if (differenceInDays(end, today) <= 30) return "expiring";
  return "active";
}
