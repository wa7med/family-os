import Database from "better-sqlite3";
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

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    sex TEXT,
    date_of_birth TEXT,
    color TEXT NOT NULL,
    avatar TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES family_members(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    due_time TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    tags TEXT,
    created_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    location TEXT,
    category TEXT,
    reminder_rules TEXT,
    recurrence TEXT,
    end_time TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    category TEXT,
    is_habit INTEGER DEFAULT 0,
    frequency TEXT,
    start_date TEXT,
    end_date TEXT,
    goal_id TEXT,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    payment_account TEXT,
    category TEXT,
    tax_deductible INTEGER DEFAULT 0,
    tax_category TEXT,
    receipt_path TEXT
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    monthly_cost REAL,
    start_date TEXT,
    end_date TEXT,
    min_duration_months INTEGER,
    notice_period_days INTEGER,
    cancel_before TEXT,
    auto_renew INTEGER DEFAULT 0,
    category TEXT,
    file_paths TEXT,
    account_deduction_day INTEGER
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    remind_at TEXT NOT NULL,
    type TEXT DEFAULT 'in-app',
    sent INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    completed_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id);
  CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
  CREATE INDEX IF NOT EXISTS idx_items_due_date ON items(due_date);
  CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
  CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(item_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_comp_unique ON habit_completions(item_id, completed_date);
`);

console.log("✅ Database migrated successfully!");
sqlite.close();
