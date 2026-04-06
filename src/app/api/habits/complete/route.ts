import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { habitCompletions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const itemId = body.itemId;
    const completedDate = body.date || format(new Date(), "yyyy-MM-dd");

    // Check if already completed today
    const existing = db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.itemId, itemId),
          eq(habitCompletions.completedDate, completedDate)
        )
      )
      .get();

    if (existing) {
      return NextResponse.json({ message: "Already completed today" }, { status: 200 });
    }

    const completion = {
      id: uuid(),
      itemId,
      completedDate,
      createdAt: new Date().toISOString(),
    };

    db.insert(habitCompletions).values(completion).run();
    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
  }
}
