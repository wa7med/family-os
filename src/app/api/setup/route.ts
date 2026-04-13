import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "data", "family-os.db");

export async function POST() {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    // Check if cancelled_at column exists
    const tableInfo = sqlite.prepare("PRAGMA table_info(contracts)").all() as Array<{name: string}>;
    const columns = new Set(tableInfo.map(col => col.name));

    let changes: string[] = [];

    if (!columns.has("cancelled_at")) {
      sqlite.exec("ALTER TABLE contracts ADD COLUMN cancelled_at TEXT");
      changes.push("cancelled_at");
    }

    if (!columns.has("is_open_ended")) {
      sqlite.exec("ALTER TABLE contracts ADD COLUMN is_open_ended INTEGER DEFAULT 0");
      changes.push("is_open_ended");
    }

    if (changes.length > 0) {
      return NextResponse.json({ success: true, message: `Added missing columns: ${changes.join(", ")}` });
    }

    return NextResponse.json({ success: true, message: "Database schema is up to date" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 500 });
  }
}
