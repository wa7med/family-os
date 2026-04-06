import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, familyMembers } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const owner = searchParams.get("owner");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");

    const conditions = [];

    if (type) conditions.push(eq(items.type, type));
    if (owner) conditions.push(eq(items.ownerId, owner));
    if (status) conditions.push(eq(items.status, status));
    if (from) conditions.push(gte(items.dueDate, from));
    if (to) conditions.push(lte(items.dueDate, to));

    const query = db
      .select({
        item: items,
        owner: familyMembers,
      })
      .from(items)
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id));

    const result = conditions.length > 0
      ? query.where(and(...conditions)).all()
      : query.all();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
