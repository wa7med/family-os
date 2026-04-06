import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { comments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = db
      .select()
      .from(comments)
      .where(eq(comments.itemId, params.id))
      .orderBy(desc(comments.createdAt))
      .all();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const comment = {
      id: uuid(),
      itemId: params.id,
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    db.insert(comments).values(comment).run();
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
