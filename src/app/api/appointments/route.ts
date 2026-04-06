import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, appointments, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const result = db
      .select({
        item: items,
        appointment: appointments,
        owner: familyMembers,
      })
      .from(appointments)
      .innerJoin(items, eq(appointments.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .all();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const itemId = uuid();

    db.insert(items).values({
      id: itemId,
      ownerId: body.ownerId,
      type: "appointment",
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate,
      dueTime: body.dueTime || null,
      priority: body.priority || "medium",
      status: "active",
      tags: body.tags ? JSON.stringify(body.tags) : null,
      createdAt: now,
      updatedAt: now,
    }).run();

    db.insert(appointments).values({
      id: uuid(),
      itemId,
      location: body.location || null,
      category: body.category || null,
      reminderRules: body.reminderRules ? JSON.stringify(body.reminderRules) : null,
      recurrence: body.recurrence ? JSON.stringify(body.recurrence) : null,
      endTime: body.endTime || null,
    }).run();

    return NextResponse.json({ id: itemId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
