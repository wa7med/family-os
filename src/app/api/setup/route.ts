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
    const hasCancelledAt = tableInfo.some(col => col.name === "cancelled_at");

    if (!hasCancelledAt) {
      // Add the missing column
      sqlite.exec("ALTER TABLE contracts ADD COLUMN cancelled_at TEXT");
      return NextResponse.json({ success: true, message: "Added cancelled_at column" });
    }

    return NextResponse.json({ success: true, message: "Column already exists, no changes needed" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 500 });
  }
}
