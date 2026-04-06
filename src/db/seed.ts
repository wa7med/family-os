import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { v4 as uuid } from "uuid";
import { familyMembers, items, appointments, tasks, expenses, contracts, comments } from "./schema";
import { addDays, subDays, format } from "date-fns";
import path from "path";
import fs from "fs";

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "data", "family-os.db");

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

const now = new Date().toISOString();
const today = format(new Date(), "yyyy-MM-dd");

// Family Members
const meId = uuid();
const wifeId = uuid();
const sonId = uuid();
const sharedId = uuid();

const members = [
  { id: meId, name: "Me", role: "husband", sex: "male", dateOfBirth: "1990-01-15", color: "#3B82F6", avatar: "👨", createdAt: now },
  { id: wifeId, name: "Wife", role: "wife", sex: "female", dateOfBirth: "1992-06-20", color: "#EC4899", avatar: "👩", createdAt: now },
  { id: sonId, name: "Son", role: "son", sex: "male", dateOfBirth: "2018-09-04", color: "#F59E0B", avatar: "👦", createdAt: now },
  { id: sharedId, name: "Family", role: "relative", sex: null, dateOfBirth: null, color: "#10B981", avatar: "👨‍👩‍👦", createdAt: now },
];

// Sample items
function createItem(ownerId: string, type: string, title: string, dueDate: string | null, priority: string = "medium", status: string = "active", dueTime: string | null = null) {
  return {
    id: uuid(),
    ownerId,
    type,
    title,
    description: null as string | null,
    dueDate,
    dueTime,
    priority,
    status,
    tags: null as string | null,
    createdAt: now,
    updatedAt: now,
  };
}

async function seed() {
  console.log("Seeding database...");

  // Insert family members
  for (const m of members) {
    db.insert(familyMembers).values(m).run();
  }
  console.log("✓ Family members created");

  // Appointments
  const dentistItem = createItem(sonId, "appointment", "Son Dentist Checkup", format(addDays(new Date(), 2), "yyyy-MM-dd"), "high", "active", "15:00");
  db.insert(items).values(dentistItem).run();
  db.insert(appointments).values({
    id: uuid(),
    itemId: dentistItem.id,
    location: "Zahnarztpraxis Dr. Schmidt",
    category: "doctor",
    reminderRules: JSON.stringify([{ before: "1d" }, { before: "2h" }]),
    recurrence: null,
    endTime: "15:30",
  }).run();

  const visaItem = createItem(meId, "appointment", "Visa Renewal Appointment", format(addDays(new Date(), 14), "yyyy-MM-dd"), "urgent", "active", "09:00");
  db.insert(items).values(visaItem).run();
  db.insert(appointments).values({
    id: uuid(),
    itemId: visaItem.id,
    location: "Ausländerbehörde Berlin",
    category: "visa",
    reminderRules: JSON.stringify([{ before: "3d" }, { before: "1d" }]),
    recurrence: null,
    endTime: null,
  }).run();

  const schoolItem = createItem(sonId, "appointment", "Parent-Teacher Meeting", format(addDays(new Date(), 5), "yyyy-MM-dd"), "medium", "active", "16:00");
  db.insert(items).values(schoolItem).run();
  db.insert(appointments).values({
    id: uuid(),
    itemId: schoolItem.id,
    location: "Grundschule am Park",
    category: "school",
    reminderRules: JSON.stringify([{ before: "1d" }]),
    recurrence: null,
    endTime: "17:00",
  }).run();

  console.log("✓ Appointments created");

  // Tasks
  const taskDefs = [
    { owner: meId, title: "Learn Kubernetes basics", cat: "upskilling", habit: false },
    { owner: meId, title: "1h English listening", cat: "upskilling", habit: true, freq: "daily" },
    { owner: meId, title: "AWS Certification study", cat: "upskilling", habit: false },
    { owner: sharedId, title: "Repair kitchen sink", cat: "home", habit: false },
    { owner: sharedId, title: "Buy new internet router", cat: "home", habit: false },
    { owner: sharedId, title: "Weekly grocery shopping", cat: "shopping", habit: true, freq: "weekly" },
    { owner: meId, title: "Submit tax documents", cat: "paperwork", habit: false },
    { owner: sonId, title: "Help with math homework", cat: "son_tasks", habit: true, freq: "daily" },
  ];

  for (const t of taskDefs) {
    const isHabit = t.habit;
    const item = createItem(t.owner, "task", t.title, isHabit ? format(subDays(new Date(), 30), "yyyy-MM-dd") : null, "medium");
    db.insert(items).values(item).run();
    db.insert(tasks).values({
      id: uuid(),
      itemId: item.id,
      category: t.cat,
      isHabit,
      frequency: (t as any).freq || null,
      startDate: isHabit ? format(subDays(new Date(), 30), "yyyy-MM-dd") : null,
      endDate: null,
      goalId: null,
      completedAt: null,
    }).run();
  }
  // Tracking tasks (long-running processes)
  const trackingDefs = [
    {
      owner: meId,
      title: "Bildungsgutschein Application",
      priority: "high",
      comments: [
        { content: "Submitted application at Agentur für Arbeit", daysAgo: 30 },
        { content: "Got email — they need proof of B1 language certificate", daysAgo: 14 },
        { content: "Uploaded B1 certificate via online portal", daysAgo: 7 },
        { content: "Waiting for final approval", daysAgo: 2 },
      ],
    },
    {
      owner: meId,
      title: "New Passport Application",
      priority: "medium",
      comments: [
        { content: "Booked appointment at Bürgeramt for passport renewal", daysAgo: 21 },
        { content: "Visited Bürgeramt, submitted documents and photos", daysAgo: 14 },
        { content: "Received SMS — passport ready for pickup", daysAgo: 1 },
      ],
    },
    {
      owner: wifeId,
      title: "Kindergeld Application",
      priority: "medium",
      comments: [
        { content: "Sent Kindergeld application form to Familienkasse", daysAgo: 45 },
        { content: "They requested additional birth certificate copy", daysAgo: 20 },
        { content: "Mailed the certified copy", daysAgo: 15 },
      ],
    },
  ];

  for (const t of trackingDefs) {
    const item = createItem(t.owner, "task", t.title, null, t.priority);
    db.insert(items).values(item).run();
    db.insert(tasks).values({
      id: uuid(),
      itemId: item.id,
      category: "tracking",
      isHabit: false,
      frequency: null,
      goalId: null,
      completedAt: null,
    }).run();
    for (const c of t.comments) {
      db.insert(comments).values({
        id: uuid(),
        itemId: item.id,
        content: c.content,
        createdAt: subDays(new Date(), c.daysAgo).toISOString(),
      }).run();
    }
  }
  console.log("✓ Tracking tasks created");

  console.log("✓ Tasks created");

  // Expenses
  const expenseDefs = [
    { owner: meId, title: "Laptop", amount: 1200, cat: "office", taxDed: true, taxCat: "home_office" },
    { owner: sonId, title: "Kinderarzt visit", amount: 45, cat: "medical", taxDed: false, taxCat: "medical" },
    { owner: meId, title: "Office desk", amount: 350, cat: "office", taxDed: true, taxCat: "home_office" },
    { owner: sharedId, title: "Weekly groceries", amount: 87.50, cat: "groceries", taxDed: false, taxCat: null },
    { owner: meId, title: "Udemy course - Docker", amount: 12.99, cat: "education", taxDed: true, taxCat: "education" },
  ];

  for (const e of expenseDefs) {
    const item = createItem(e.owner, "expense", e.title, today);
    db.insert(items).values(item).run();
    db.insert(expenses).values({
      id: uuid(),
      itemId: item.id,
      amount: e.amount,
      currency: "EUR",
      paymentAccount: "Main Account",
      category: e.cat,
      taxDeductible: e.taxDed,
      taxCategory: e.taxCat,
      receiptPath: null,
    }).run();
  }
  console.log("✓ Expenses created");

  // Contracts
  const contractDefs = [
    {
      owner: sharedId, title: "Vodafone Mobile", provider: "Vodafone", cost: 39.99,
      start: "2024-01-01", end: format(addDays(new Date(), 45), "yyyy-MM-dd"),
      noticeDays: 90, autoRenew: true, cat: "mobile", deductionDay: 1,
    },
    {
      owner: sharedId, title: "Telekom Internet", provider: "Deutsche Telekom", cost: 44.95,
      start: "2023-06-01", end: format(addDays(new Date(), 180), "yyyy-MM-dd"),
      noticeDays: 90, autoRenew: true, cat: "internet", deductionDay: 15,
    },
    {
      owner: sharedId, title: "Electricity - Vattenfall", provider: "Vattenfall", cost: 89,
      start: "2024-03-01", end: format(addDays(new Date(), 365), "yyyy-MM-dd"),
      noticeDays: 30, autoRenew: true, cat: "electricity", deductionDay: 5,
    },
    {
      owner: meId, title: "Gym Membership", provider: "FitX", cost: 24.99,
      start: "2024-09-01", end: format(addDays(new Date(), 90), "yyyy-MM-dd"),
      noticeDays: 30, autoRenew: true, cat: "gym", deductionDay: 1,
    },
    {
      owner: sharedId, title: "Car Insurance", provider: "HUK-COBURG", cost: 67.50,
      start: "2024-01-01", end: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      noticeDays: 30, autoRenew: true, cat: "insurance", deductionDay: 1,
    },
  ];

  for (const c of contractDefs) {
    const item = createItem(c.owner, "contract", c.title, c.end, "medium");
    const cancelBefore = format(subDays(new Date(c.end), c.noticeDays), "yyyy-MM-dd");
    db.insert(items).values(item).run();
    db.insert(contracts).values({
      id: uuid(),
      itemId: item.id,
      provider: c.provider,
      monthlyCost: c.cost,
      startDate: c.start,
      endDate: c.end,
      minDurationMonths: 12,
      noticePeriodDays: c.noticeDays,
      cancelBefore,
      autoRenew: c.autoRenew,
      category: c.cat,
      filePaths: null,
      accountDeductionDay: c.deductionDay,
    }).run();
  }
  console.log("✓ Contracts created");

  console.log("\n✅ Database seeded successfully!");
  sqlite.close();
}

seed().catch(console.error);
