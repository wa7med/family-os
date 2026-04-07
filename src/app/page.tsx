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
          <div key={i} className="h-32 bg-[#F0F1F3] animate-pulse rounded-[22px]" />
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
    <div className="px-4 pt-6 pb-24">
      {/* Greeting Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#032d42] mb-1">Hello there</h1>
        <p className="text-base text-[#032d42]/60">Welcome to your Family Life OS!</p>
      </div>

      <div className="space-y-4">
      {/* Tabbed Tasks: Urgent Today, This Week, Contract Alerts, In Progress */}
      <TabbedTasksCard
        urgentToday={data?.urgentToday || []}
        thisWeek={data?.thisWeek || []}
        contractAlerts={data?.contractAlerts || []}
        inProgress={data?.inProgress || []}
        onRefresh={refresh}
      />

      {/* Finance Snapshot */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-[#3B82F6] rounded-full" />
          <h2 className="text-lg font-bold text-[#032d42]">Finance Snapshot</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-white border border-[#E5E7EB] rounded-[18px]">
            <DollarSign className="h-5 w-5 text-[#F4B400] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#032d42]">
              {data?.finance?.monthlyExpenses?.toFixed(2) || "0.00"}
            </p>
            <p className="text-[10px] text-[#032d42]/50">Monthly Spend</p>
          </div>
          <div className="text-center p-4 bg-white border border-[#E5E7EB] rounded-[18px]">
            <TrendingUp className="h-5 w-5 text-[#21D07A] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#21D07A]">
              {data?.finance?.taxDeductibleTotal?.toFixed(2) || "0.00"}
            </p>
            <p className="text-[10px] text-[#032d42]/50">Tax Deductible</p>
          </div>
          <div className="text-center p-4 bg-white border border-[#E5E7EB] rounded-[18px]">
            <FileText className="h-5 w-5 text-[#3B82F6] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#032d42]">
              {data?.finance?.monthlyContractCosts?.toFixed(2) || "0.00"}
            </p>
            <p className="text-[10px] text-[#032d42]/50">Contracts/mo</p>
          </div>
        </div>
      </div>

      {/* Daily Focus */}
      <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare className="h-5 w-5 text-[#21D07A]" />
          <h2 className="text-lg font-bold text-[#032d42]">Daily Focus</h2>
        </div>
        {data?.dailyTasks && data.dailyTasks.length > 0 ? (
          <div className="space-y-1">
            {data.dailyTasks.map((entry) => (
              <div
                key={entry.item.id}
                className="flex items-center gap-3 py-3 border-b border-[#E5E7EB] last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {entry.owner && (
                    <FamilyBadge
                      name={entry.owner.name}
                      color={entry.owner.color}
                      avatar={entry.owner.avatar}
                    />
                  )}
                  <span className="text-sm text-[#032d42] truncate">{entry.item.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {entry.task.isHabit && (
                    <Badge className="text-[10px] flex-shrink-0 bg-[#F0F1F3] text-[#032d42]/60">
                      {entry.task.frequency}
                    </Badge>
                  )}
                  <DailyFocusActions itemId={entry.item.id} title={entry.item.title} onAction={refresh} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#032d42]/50 text-center py-4">No tasks for today</p>
        )}
      </div>
      </div>
    </div>
  );
}
