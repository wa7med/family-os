export const FAMILY_ROLES = [
  "husband",
  "wife",
  "son",
  "daughter",
  "relative",
  "grandfather",
  "grandmother",
  "aunt",
  "uncle",
] as const;
export type FamilyRole = (typeof FAMILY_ROLES)[number];

export const SEX_OPTIONS = ["male", "female"] as const;
export type Sex = (typeof SEX_OPTIONS)[number];

export const ROLE_AVATARS: Record<string, string> = {
  husband: "👨",
  wife: "👩",
  son: "👦",
  daughter: "👧",
  relative: "🧑",
  grandfather: "👨",
  grandmother: "👩",
  aunt: "👩",
  uncle: "👨",
};

export const FAMILY_COLORS: Record<string, string> = {
  husband: "#4A7B65",
  wife: "#7B9E87",
  son: "#8BA888",
  daughter: "#6B917A",
  relative: "#5B8A72",
  grandfather: "#3D6B55",
  grandmother: "#6B917A",
  aunt: "#7B9E87",
  uncle: "#4A7B65",
  shared: "#5B8A72",
};

export const SEX_AVATARS: Record<Sex, { adult: string; child: string }> = {
  male: { adult: "👨", child: "👦" },
  female: { adult: "👩", child: "👧" },
};

export const ITEM_TYPES = ["appointment", "task", "expense", "contract"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const PRIORITY_LEVELS = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITY_LEVELS)[number];

export const APPOINTMENT_CATEGORIES = [
  "doctor",
  "school",
  "visa",
  "meeting",
  "birthday",
  "renewal",
  "other",
] as const;

export const TASK_CATEGORIES = [
  "upskilling",
  "home",
  "shopping",
  "paperwork",
  "work",
  "son_tasks",
  "tracking",
  "other",
] as const;

export const EXPENSE_CATEGORIES = [
  "groceries",
  "medical",
  "education",
  "office",
  "transport",
  "housing",
  "restaurant",
  "entertainment",
  "clothing",
  "subscriptions",
  "other",
] as const;

export const TAX_CATEGORIES = [
  "business",
  "home_office",
  "child",
  "medical",
  "education",
  "donation",
  "other",
] as const;

export const CONTRACT_CATEGORIES = [
  "mobile",
  "internet",
  "electricity",
  "gym",
  "insurance",
  "school_fees",
  "software",
  "hosting",
  "cloud",
  "other",
] as const;

export const DURATION_OPTIONS = [
  { value: "1", label: "1 month" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "1 year" },
  { value: "24", label: "2 years" },
  { value: "36", label: "3 years" },
  { value: "48", label: "4 years" },
  { value: "60", label: "5 years" },
  { value: "72", label: "6 years" },
] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  low: "#6B7280",      // Gray - lowest urgency
  medium: "#3B82F6",   // Blue - moderate
  high: "#F97316",     // Orange - high urgency
  urgent: "#EF4444",   // Red - critical/urgent
};
