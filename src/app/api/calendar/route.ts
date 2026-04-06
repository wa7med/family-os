import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, familyMembers } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "from and to parameters required" }, { status: 400 });
    }

    const result = db
      .select({ item: items, owner: familyMembers })
      .from(items)
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(
        and(
          gte(items.dueDate, from),
          lte(items.dueDate, to),
          eq(items.status, "active")
        )
      )
      .all();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar items" }, { status: 500 });
  }
}
