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
  husband: "H",
  wife: "W",
  son: "S",
  daughter: "D",
  relative: "R",
  grandfather: "G",
  grandmother: "G",
  aunt: "A",
  uncle: "U",
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
  low: "#8BA888",
  medium: "#5B8A72",
  high: "#4A7B65",
  urgent: "#2F5E47",
};
