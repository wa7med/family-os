import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, tasks, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const result = db
      .select({
        item: items,
        task: tasks,
        owner: familyMembers,
      })
      .from(tasks)
      .innerJoin(items, eq(tasks.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .all();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const itemId = uuid();

    const isHabit = body.isHabit || false;

    db.insert(items).values({
      id: itemId,
      ownerId: body.ownerId,
      type: "task",
      title: body.title,
      description: body.description || null,
      dueDate: isHabit ? (body.startDate || null) : (body.dueDate || null),
      dueTime: null,
      priority: body.priority || "medium",
      status: "active",
      tags: body.tags ? JSON.stringify(body.tags) : null,
      createdAt: now,
      updatedAt: now,
    }).run();

    db.insert(tasks).values({
      id: uuid(),
      itemId,
      category: body.category || null,
      isHabit,
      frequency: body.frequency || null,
      startDate: isHabit ? (body.startDate || null) : null,
      endDate: isHabit ? (body.endDate || null) : null,
      goalId: body.goalId || null,
      completedAt: null,
    }).run();

    return NextResponse.json({ id: itemId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
