import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { familyMembers, items, appointments } from "@/db/schema";
import { v4 as uuid } from "uuid";

function getNextBirthday(dateOfBirth: string): string {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  const thisYear = today.getFullYear();
  const birthday = new Date(thisYear, dob.getMonth(), dob.getDate());
  if (birthday < today) {
    birthday.setFullYear(thisYear + 1);
  }
  return birthday.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const members = db.select().from(familyMembers).all();
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch family members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const member = {
      id: uuid(),
      name: body.name,
      role: body.role,
      sex: body.sex || null,
      dateOfBirth: body.dateOfBirth || null,
      color: body.color,
      avatar: body.avatar || null,
      createdAt: now,
    };
    db.insert(familyMembers).values(member).run();

    // Auto-create birthday appointment if dateOfBirth is provided
    if (body.dateOfBirth) {
      const nextBday = getNextBirthday(body.dateOfBirth);
      const itemId = uuid();
      db.insert(items).values({
        id: itemId,
        ownerId: member.id,
        type: "appointment",
        title: `🎂 ${body.name}'s Birthday`,
        description: null,
        dueDate: nextBday,
        dueTime: null,
        priority: "medium",
        status: "active",
        tags: JSON.stringify(["birthday"]),
        createdAt: now,
        updatedAt: now,
      }).run();
      db.insert(appointments).values({
        id: uuid(),
        itemId,
        location: null,
        category: "birthday",
        reminderRules: JSON.stringify([{ before: "7d" }, { before: "1d" }]),
        recurrence: JSON.stringify({ freq: "yearly", interval: 1 }),
        endTime: null,
      }).run();
    }

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create family member" }, { status: 500 });
  }
}
