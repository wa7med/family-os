import { NextResponse } from "next/server";
import db from "@/db";
import { items, appointments, tasks, expenses, contracts, familyMembers, comments, habitCompletions } from "@/db/schema";
import { eq, and, gte, lte, sql, isNull, or } from "drizzle-orm";
import { format, addDays } from "date-fns";

export async function GET() {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const weekEnd = format(addDays(new Date(), 7), "yyyy-MM-dd");
    const monthEnd = format(addDays(new Date(), 30), "yyyy-MM-dd");

    // Urgent today: regular items due today (excluding habits — they come from habitUrgent)
    const regularUrgent = db
      .select({ item: items, owner: familyMembers, task: tasks })
      .from(items)
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .leftJoin(tasks, eq(tasks.itemId, items.id))
      .where(and(eq(items.dueDate, today), eq(items.status, "active")))
      .all()
      .filter((e) => e.item.type !== "expense" && !e.task?.isHabit)
      .map((e) => ({ item: e.item, owner: e.owner, isHabit: false }));

    // Urgent today: habit tasks active today (startDate <= today, endDate null or >= today)
    // excluding those already completed today
    const habitUrgent = db
      .select({ item: items, task: tasks, owner: familyMembers })
      .from(tasks)
      .innerJoin(items, eq(tasks.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(
        and(
          eq(items.status, "active"),
          eq(tasks.isHabit, true),
          lte(tasks.startDate, today),
          or(isNull(tasks.endDate), gte(tasks.endDate, today))
        )
      )
      .all()
      .filter((e) => {
        // Exclude habits already completed today
        const completed = db
          .select()
          .from(habitCompletions)
          .where(
            and(
              eq(habitCompletions.itemId, e.item.id),
              eq(habitCompletions.completedDate, today)
            )
          )
          .get();
        return !completed;
      })
      .map((e) => ({ item: e.item, owner: e.owner, isHabit: true }));

    const urgentToday = [...regularUrgent, ...habitUrgent];

    // This week: items due this week (excluding today)
    const thisWeek = db
      .select({ item: items, owner: familyMembers })
      .from(items)
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(
        and(
          sql`${items.dueDate} > ${today}`,
          lte(items.dueDate, weekEnd),
          eq(items.status, "active")
        )
      )
      .all();

    // Contract alerts: contracts with cancel_before approaching
    const contractAlerts = db
      .select({ item: items, contract: contracts, owner: familyMembers })
      .from(contracts)
      .innerJoin(items, eq(contracts.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(
        and(
          lte(contracts.cancelBefore, monthEnd),
          eq(items.status, "active")
        )
      )
      .all();

    // Finance snapshot: monthly expenses
    const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
    const monthlyExpenses = db
      .select({
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        taxDeductibleTotal: sql<number>`COALESCE(SUM(CASE WHEN ${expenses.taxDeductible} = 1 THEN ${expenses.amount} ELSE 0 END), 0)`,
      })
      .from(expenses)
      .innerJoin(items, eq(expenses.itemId, items.id))
      .where(gte(items.dueDate, monthStart))
      .all();

    // Daily focus: active habit tasks only
    const dailyTasks = db
      .select({ item: items, task: tasks, owner: familyMembers })
      .from(tasks)
      .innerJoin(items, eq(tasks.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(and(eq(items.status, "active"), eq(tasks.isHabit, true)))
      .limit(5)
      .all();

    // In progress: active tracking tasks with latest comment
    const trackingTasks = db
      .select({ item: items, task: tasks, owner: familyMembers })
      .from(tasks)
      .innerJoin(items, eq(tasks.itemId, items.id))
      .leftJoin(familyMembers, eq(items.ownerId, familyMembers.id))
      .where(
        and(
          eq(items.status, "active"),
          eq(tasks.category, "tracking"),
          eq(tasks.isHabit, false)
        )
      )
      .all();

    // Attach latest comment to each tracking task
    const inProgress = trackingTasks.map((t) => {
      const latestComment = db
        .select()
        .from(comments)
        .where(eq(comments.itemId, t.item.id))
        .orderBy(sql`${comments.createdAt} DESC`)
        .limit(1)
        .all();
      return {
        ...t,
        latestComment: latestComment[0] || null,
      };
    });

    // Monthly contract costs
    const monthlyCosts = db
      .select({
        total: sql<number>`COALESCE(SUM(${contracts.monthlyCost}), 0)`,
      })
      .from(contracts)
      .innerJoin(items, eq(contracts.itemId, items.id))
      .where(eq(items.status, "active"))
      .all();

    return NextResponse.json({
      urgentToday,
      thisWeek,
      contractAlerts,
      finance: {
        monthlyExpenses: monthlyExpenses[0]?.total || 0,
        taxDeductibleTotal: monthlyExpenses[0]?.taxDeductibleTotal || 0,
        monthlyContractCosts: monthlyCosts[0]?.total || 0,
      },
      dailyTasks,
      inProgress,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
