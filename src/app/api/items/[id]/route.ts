import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format, addDays } from "date-fns";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const item = db.select().from(items).where(eq(items.id, id)).get();
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Status change: completed, cancelled, active
    if (body.status) {
      updates.status = body.status;
    }

    // Postpone: shift dueDate by N days (default 1)
    if (body.postponeDays && item.dueDate) {
      const newDate = addDays(new Date(item.dueDate), body.postponeDays);
      updates.dueDate = format(newDate, "yyyy-MM-dd");
    }

    // Direct dueDate override
    if (body.dueDate) {
      updates.dueDate = body.dueDate;
    }

    db.update(items).set(updates).where(eq(items.id, id)).run();

    const updated = db.select().from(items).where(eq(items.id, id)).get();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
