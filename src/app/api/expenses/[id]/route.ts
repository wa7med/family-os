import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, expenses, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = db
      .select({ item: items, expense: expenses, owner: familyMembers })
      .from(expenses)
      .innerJoin(items, eq(expenses.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(eq(items.id, params.id))
      .get();

    if (!result) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expense" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    // Update item fields (title, date, owner)
    const itemUpdates: Record<string, any> = { updatedAt: now };
    if (body.title !== undefined) itemUpdates.title = body.title;
    if (body.dueDate !== undefined) itemUpdates.dueDate = body.dueDate;
    if (body.ownerId !== undefined) itemUpdates.ownerId = body.ownerId;

    db.update(items).set(itemUpdates).where(eq(items.id, params.id)).run();

    // Update expense fields (amount, currency, category, tax, etc.)
    const expenseUpdates: Record<string, any> = {};
    if (body.amount !== undefined) expenseUpdates.amount = body.amount;
    if (body.currency !== undefined) expenseUpdates.currency = body.currency;
    if (body.category !== undefined) expenseUpdates.category = body.category;
    if (body.paymentAccount !== undefined) expenseUpdates.paymentAccount = body.paymentAccount;
    if (body.taxDeductible !== undefined) expenseUpdates.taxDeductible = body.taxDeductible;
    if (body.taxCategory !== undefined) expenseUpdates.taxCategory = body.taxCategory;

    if (Object.keys(expenseUpdates).length > 0) {
      db.update(expenses).set(expenseUpdates).where(eq(expenses.itemId, params.id)).run();
    }

    const updated = db
      .select({ item: items, expense: expenses, owner: familyMembers })
      .from(expenses)
      .innerJoin(items, eq(expenses.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(eq(items.id, params.id))
      .get();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Deleting the item cascades to expenses table
    const result = db.delete(items).where(eq(items.id, params.id)).run();
    if (result.changes === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
