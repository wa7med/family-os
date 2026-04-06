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
  grandfather: "👴",
  grandmother: "👵",
  aunt: "👩",
  uncle: "👨",
};

export const FAMILY_COLORS: Record<string, string> = {
  husband: "#3B82F6",
  wife: "#EC4899",
  son: "#F59E0B",
  daughter: "#A855F7",
  relative: "#10B981",
  grandfather: "#6366F1",
  grandmother: "#F472B6",
  aunt: "#14B8A6",
  uncle: "#0EA5E9",
  shared: "#10B981",
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

export const PRIORITY_COLORS: Record<string, string> = {
  low: "#6B7280",
  medium: "#3B82F6",
  high: "#F59E0B",
  urgent: "#EF4444",
};
