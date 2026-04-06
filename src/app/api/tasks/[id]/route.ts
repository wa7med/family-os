import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, tasks, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // id here is the item ID (since tasks are linked via itemId)
    const result = db
      .select({ item: items, task: tasks, owner: familyMembers })
      .from(tasks)
      .innerJoin(items, eq(tasks.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(eq(items.id, params.id))
      .all();

    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}
