import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, contracts, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { computeCancelDeadline } from "@/lib/deadline-engine";

export async function GET() {
  try {
    const result = db
      .select({
        item: items,
        contract: contracts,
        owner: familyMembers,
      })
      .from(contracts)
      .innerJoin(items, eq(contracts.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .all();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const itemId = uuid();

    const cancelBefore = body.endDate && body.noticePeriodDays
      ? computeCancelDeadline(body.endDate, body.noticePeriodDays)
      : null;

    db.insert(items).values({
      id: itemId,
      ownerId: body.ownerId,
      type: "contract",
      title: body.title,
      description: body.description || null,
      dueDate: body.endDate || null,
      dueTime: null,
      priority: body.priority || "medium",
      status: "active",
      tags: body.tags ? JSON.stringify(body.tags) : null,
      createdAt: now,
      updatedAt: now,
    }).run();

    db.insert(contracts).values({
      id: uuid(),
      itemId,
      provider: body.provider,
      monthlyCost: body.monthlyCost || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      minDurationMonths: body.minDurationMonths || null,
      noticePeriodDays: body.noticePeriodDays || null,
      cancelBefore,
      autoRenew: body.autoRenew || false,
      category: body.category || null,
      filePaths: body.filePaths ? JSON.stringify(body.filePaths) : null,
      accountDeductionDay: body.accountDeductionDay || null,
    }).run();

    return NextResponse.json({ id: itemId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create contract" }, { status: 500 });
  }
}
