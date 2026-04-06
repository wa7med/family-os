import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, expenses, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const result = db
      .select({
        item: items,
        expense: expenses,
        owner: familyMembers,
      })
      .from(expenses)
      .innerJoin(items, eq(expenses.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .all();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
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
      type: "expense",
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate || new Date().toISOString().split("T")[0],
      dueTime: null,
      priority: body.priority || "medium",
      status: "active",
      tags: body.tags ? JSON.stringify(body.tags) : null,
      createdAt: now,
      updatedAt: now,
    }).run();

    db.insert(expenses).values({
      id: uuid(),
      itemId,
      amount: body.amount,
      currency: body.currency || "EUR",
      paymentAccount: body.paymentAccount || null,
      category: body.category || null,
      taxDeductible: body.taxDeductible || false,
      taxCategory: body.taxCategory || null,
      receiptPath: body.receiptPath || null,
    }).run();

    return NextResponse.json({ id: itemId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
