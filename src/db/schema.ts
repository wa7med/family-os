import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const familyMembers = sqliteTable("family_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // husband, wife, son, daughter, relative, grandfather, grandmother, aunt, uncle
  sex: text("sex"), // male, female
  dateOfBirth: text("date_of_birth"), // ISO date string
  color: text("color").notNull(),
  avatar: text("avatar"), // emoji or image path
  createdAt: text("created_at").notNull().default(""),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => familyMembers.id),
  type: text("type").notNull(), // appointment, task, expense, contract
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date"), // ISO date string
  dueTime: text("due_time"), // HH:mm
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("active"), // active, completed, cancelled, archived
  tags: text("tags"), // JSON array string
  createdAt: text("created_at").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(""),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  location: text("location"),
  category: text("category"), // doctor, school, visa, meeting, birthday, renewal
  reminderRules: text("reminder_rules"), // JSON: e.g. [{"before": "1d"}, {"before": "1h"}]
  recurrence: text("recurrence"), // JSON: e.g. {"freq": "weekly", "interval": 1}
  endTime: text("end_time"), // HH:mm
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  category: text("category"), // upskilling, home, shopping, paperwork, work, son_tasks
  isHabit: integer("is_habit", { mode: "boolean" }).default(false),
  frequency: text("frequency"), // daily, weekly, monthly (for habits)
  startDate: text("start_date"), // habit start date (ISO date)
  endDate: text("end_date"), // habit end date (ISO date, optional)
  goalId: text("goal_id"), // parent goal task ID
  completedAt: text("completed_at"),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  currency: text("currency").default("EUR"),
  paymentAccount: text("payment_account"),
  category: text("category"), // groceries, medical, education, office, transport, etc.
  taxDeductible: integer("tax_deductible", { mode: "boolean" }).default(false),
  taxCategory: text("tax_category"), // business, home_office, child, medical, education
  receiptPath: text("receipt_path"),
});

export const contracts = sqliteTable("contracts", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  monthlyCost: real("monthly_cost"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  minDurationMonths: integer("min_duration_months"),
  noticePeriodDays: integer("notice_period_days"),
  cancelBefore: text("cancel_before"), // auto-computed: endDate - noticePeriodDays
  autoRenew: integer("auto_renew", { mode: "boolean" }).default(false),
  cancelledAt: text("cancelled_at"), // when user requested cancellation (stays active until end of billing period)
  isOpenEnded: integer("is_open_ended", { mode: "boolean" }).default(false), // no end date (e.g. rent)
  category: text("category"), // mobile, internet, electricity, gym, insurance, software, hosting
  filePaths: text("file_paths"), // JSON array of file paths
  accountDeductionDay: integer("account_deduction_day"), // day of month
});

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  remindAt: text("remind_at").notNull(), // ISO datetime
  type: text("type").default("in-app"), // push, email, in-app
  sent: integer("sent", { mode: "boolean" }).default(false),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  uploadedAt: text("uploaded_at").notNull().default(""),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(""),
});

export const habitCompletions = sqliteTable("habit_completions", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  completedDate: text("completed_date").notNull(), // ISO date e.g. "2026-04-04"
  createdAt: text("created_at").notNull().default(""),
});

// Type exports
export type FamilyMember = typeof familyMembers.$inferSelect;
export type NewFamilyMember = typeof familyMembers.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
