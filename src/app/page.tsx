"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FamilyBadge } from "@/components/shared/family-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ItemActions, DailyFocusActions } from "@/components/shared/item-actions";
import { TabbedTasksCard } from "@/components/dashboard/tabbed-tasks-card";
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  Loader,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface DashboardData {
  urgentToday: Array<{ item: any; owner: any; isHabit: boolean }>;
  thisWeek: Array<{ item: any; owner: any }>;
  contractAlerts: Array<{ item: any; contract: any; owner: any }>;
  finance: {
    monthlyExpenses: number;
    taxDeductibleTotal: number;
    monthlyContractCosts: number;
  };
  dailyTasks: Array<{ item: any; task: any; owner: any }>;
  inProgress: Array<{ item: any; task: any; owner: any; latestComment: any }>;
}

export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useFetch<DashboardData>("/api/dashboard");

  function refresh() {
    mutate();
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Failed to load dashboard. Please try again.
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 space-y-4">
      {/* Tabbed Tasks: Urgent Today, This Week, Contract Alerts, In Progress */}
      <TabbedTasksCard
        urgentToday={data?.urgentToday || []}
        thisWeek={data?.thisWeek || []}
        contractAlerts={data?.contractAlerts || []}
        inProgress={data?.inProgress || []}
        onRefresh={refresh}
      />

      {/* Finance Snapshot */}
      <Card className="border-border bg-card rounded-[22px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5 text-[#F4B400]" />
            Finance Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted rounded-[18px]">
              <p className="text-lg font-bold text-foreground">
                {data?.finance?.monthlyExpenses?.toFixed(2) || "0.00"}
              </p>
              <p className="text-[10px] text-muted-foreground">Monthly Spend</p>
            </div>
            <div className="text-center p-3 bg-accent/10 rounded-[18px]">
              <p className="text-lg font-bold text-accent">
                {data?.finance?.taxDeductibleTotal?.toFixed(2) || "0.00"}
              </p>
              <p className="text-[10px] text-muted-foreground">Tax Deductible</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-[18px]">
              <p className="text-lg font-bold text-foreground">
                {data?.finance?.monthlyContractCosts?.toFixed(2) || "0.00"}
              </p>
              <p className="text-[10px] text-muted-foreground">Contracts/mo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Focus */}
      <Card className="border-border bg-card rounded-[22px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CheckSquare className="h-5 w-5 text-accent" />
            Daily Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.dailyTasks && data.dailyTasks.length > 0 ? (
            <div className="space-y-2">
              {data.dailyTasks.map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <span className="text-sm text-foreground truncate">{entry.item.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.task.isHabit && (
                      <Badge className="text-[10px] flex-shrink-0 bg-muted text-secondary">
                        {entry.task.frequency}
                      </Badge>
                    )}
                    <DailyFocusActions itemId={entry.item.id} title={entry.item.title} onAction={refresh} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No tasks for today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
