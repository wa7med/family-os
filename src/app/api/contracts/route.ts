import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { items, contracts, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { computeCancelDeadline } from "@/lib/deadline-engine";
import { addMonths, format } from "date-fns";

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

    // Auto-renew expired contracts (but not those with pending cancellation)
    const now = new Date();
    for (const entry of result) {
      if (entry.contract.cancelledAt) {
        // Contract has pending cancellation - check if billing period ended
        if (entry.contract.endDate && new Date(entry.contract.endDate) < now) {
          // Billing period ended, mark as truly cancelled
          db.update(items)
            .set({ status: "cancelled", updatedAt: now.toISOString() })
            .where(eq(items.id, entry.item.id))
            .run();
          entry.item.status = "cancelled";
        }
        continue;
      }

      if (
        entry.contract.autoRenew &&
        entry.item.status !== "cancelled" &&
        entry.contract.endDate &&
        new Date(entry.contract.endDate) < now
      ) {
        // Contract has expired and autoRenew is enabled - auto-renew it
        const durationMonths = entry.contract.minDurationMonths || 12;
        const noticeDays = entry.contract.noticePeriodDays || 30;

        const currentEndDate = new Date(entry.contract.endDate);
        const newStartDate = format(currentEndDate, "yyyy-MM-dd");
        const newEndDate = format(addMonths(currentEndDate, durationMonths), "yyyy-MM-dd");
        const newCancelBefore = computeCancelDeadline(newEndDate, noticeDays);

        // Update contract
        db.update(contracts)
          .set({
            startDate: newStartDate,
            endDate: newEndDate,
            cancelBefore: newCancelBefore,
            updatedAt: now.toISOString(),
          })
          .where(eq(contracts.id, entry.contract.id))
          .run();

        // Update item dueDate
        db.update(items)
          .set({ dueDate: newEndDate, updatedAt: now.toISOString() })
          .where(eq(items.id, entry.item.id))
          .run();

        // Update the result object so UI sees the new dates
        entry.contract.endDate = newEndDate;
        entry.contract.cancelBefore = newCancelBefore;
        entry.item.dueDate = newEndDate;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    const now = new Date().toISOString();
    const itemId = uuid();

    // Validate required fields
    if (!body.ownerId) {
      return NextResponse.json({ error: "Owner is required" }, { status: 400 });
    }
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!body.provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    // Calculate endDate from startDate + duration if endDate is not provided
    let endDate = body.endDate || null;
    if (!endDate && body.startDate && body.minDurationMonths) {
      const months = parseInt(body.minDurationMonths);
      if (!isNaN(months) && months > 0) {
        endDate = format(addMonths(new Date(body.startDate), months), "yyyy-MM-dd");
      }
    }

    // Only compute cancelBefore if we have both endDate and noticePeriodDays
    let cancelBefore = null;
    const noticeDays = body.noticePeriodDays ? parseInt(body.noticePeriodDays) : null;
    if (endDate && noticeDays !== null && noticeDays > 0) {
      cancelBefore = computeCancelDeadline(endDate, noticeDays);
    }

    console.log("Calculated values:", { endDate, cancelBefore, noticeDays });

    db.insert(items).values({
      id: itemId,
      ownerId: body.ownerId,
      type: "contract",
      title: body.title,
      description: body.description || null,
      dueDate: endDate,
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
      monthlyCost: body.monthlyCost ? parseFloat(body.monthlyCost) : null,
      startDate: body.startDate || null,
      endDate,
      minDurationMonths: body.minDurationMonths ? parseInt(body.minDurationMonths) : null,
      noticePeriodDays: noticeDays,
      cancelBefore,
      autoRenew: body.autoRenew || false,
      category: body.category || null,
      filePaths: body.filePaths ? JSON.stringify(body.filePaths) : null,
      accountDeductionDay: body.accountDeductionDay ? parseInt(body.accountDeductionDay) : null,
    }).run();

    return NextResponse.json({ id: itemId }, { status: 201 });
  } catch (error) {
    console.error("Create contract error:", error);
    return NextResponse.json({ error: "Failed to create contract", details: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, itemId, action } = body;

    if (!contractId || !itemId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === "cancel") {
      // Immediate cancellation - update item status to cancelled
      db.update(items)
        .set({ status: "cancelled", updatedAt: now })
        .where(eq(items.id, itemId))
        .run();

      return NextResponse.json({ success: true, message: "Contract cancelled" });
    }

    if (action === "requestCancel") {
      // Request cancellation - keeps contract active until end of billing period
      // Sets cancelledAt timestamp, but item stays active until endDate passes
      db.update(contracts)
        .set({ cancelledAt: now, updatedAt: now })
        .where(eq(contracts.id, contractId))
        .run();

      return NextResponse.json({
        success: true,
        message: "Cancellation requested - contract stays active until end of billing period"
      });
    }

    if (action === "undoCancel") {
      // Undo cancellation request - restore auto-renew
      db.update(contracts)
        .set({ cancelledAt: null, updatedAt: now })
        .where(eq(contracts.id, contractId))
        .run();

      return NextResponse.json({ success: true, message: "Cancellation request undone" });
    }

    if (action === "renew") {
      // Renew the contract - extend by duration, update dates
      const contract = db.select().from(contracts).where(eq(contracts.id, contractId)).get();

      if (!contract) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }

      const durationMonths = contract.minDurationMonths || 12;
      const noticeDays = contract.noticePeriodDays || 30;

      // Calculate new dates
      const currentEndDate = contract.endDate ? new Date(contract.endDate) : new Date();
      const newStartDate = format(currentEndDate, "yyyy-MM-dd");
      const newEndDate = format(addMonths(currentEndDate, durationMonths), "yyyy-MM-dd");
      const newCancelBefore = computeCancelDeadline(newEndDate, noticeDays);

      // Update contract
      db.update(contracts)
        .set({
          startDate: newStartDate,
          endDate: newEndDate,
          cancelBefore: newCancelBefore,
          autoRenew: contract.autoRenew,
          updatedAt: now,
        })
        .where(eq(contracts.id, contractId))
        .run();

      // Update item dueDate
      db.update(items)
        .set({ dueDate: newEndDate, updatedAt: now })
        .where(eq(items.id, itemId))
        .run();

      return NextResponse.json({
        success: true,
        message: "Contract renewed",
        newEndDate,
        newCancelBefore,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Contract action error:", error);
    return NextResponse.json({ error: "Failed to process contract action" }, { status: 500 });
  }
}
