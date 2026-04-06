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

// Create migrations tracking table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Read all migration files sorted by name
const migrationsDir = path.join(__dirname, "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f: string) => f.endsWith(".sql"))
  .sort();

// Get already applied migrations
const applied = new Set(
  sqlite
    .prepare("SELECT name FROM _migrations")
    .all()
    .map((row: any) => row.name)
);

let newCount = 0;

for (const file of files) {
  if (applied.has(file)) {
    console.log(`⏭  ${file} (already applied)`);
    continue;
  }

  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

  try {
    sqlite.exec(sql);
    sqlite.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
    console.log(`✅ ${file} applied`);
    newCount++;
  } catch (err) {
    console.error(`❌ Failed to apply ${file}:`, err);
    process.exit(1);
  }
}

if (newCount === 0) {
  console.log("📦 Database is up to date — no new migrations.");
} else {
  console.log(`\n✅ Applied ${newCount} new migration(s).`);
}

sqlite.close();
