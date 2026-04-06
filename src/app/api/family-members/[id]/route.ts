import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { familyMembers, items } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check member exists
    const member = db.select().from(familyMembers).where(eq(familyMembers.id, id)).get();
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Delete all items owned by this member (cascades to appointments, tasks, etc.)
    db.delete(items).where(eq(items.ownerId, id)).run();

    // Delete the member
    db.delete(familyMembers).where(eq(familyMembers.id, id)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete family member" }, { status: 500 });
  }
}
