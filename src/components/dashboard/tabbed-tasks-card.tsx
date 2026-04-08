"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FamilyBadge } from "@/components/shared/family-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ItemActions } from "@/components/shared/item-actions";
import { Flame, CalendarDays, FileWarning, ListChecks } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface TabbedTasksCardProps {
  urgentToday: Array<{ item: any; owner: any; isHabit: boolean }>;
  thisWeek: Array<{ item: any; owner: any }>;
  contractAlerts: Array<{ item: any; contract: any; owner: any }>;
  inProgress: Array<{ item: any; task: any; owner: any; latestComment: any }>;
  onRefresh: () => void;
}

type TabType = "urgent" | "week" | "contracts" | "progress";

export function TabbedTasksCard({
  urgentToday,
  thisWeek,
  contractAlerts,
  inProgress,
  onRefresh,
}: TabbedTasksCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("urgent");

  const tabs = [
    { id: "urgent" as TabType, icon: Flame, label: "Urgent", color: "text-red-500" },
    { id: "week" as TabType, icon: CalendarDays, label: "Week", color: "text-blue-500" },
    { id: "contracts" as TabType, icon: FileWarning, label: "Alerts", color: "text-amber-500" },
    { id: "progress" as TabType, icon: ListChecks, label: "Progress", color: "text-indigo-500" },
  ];

  return (
    <div>
      {/* Main Content Card — medium sage green */}
      <div className="bg-[#5B8A72] rounded-[22px] overflow-hidden p-5 min-h-[220px] shadow-elevated">
        {/* Urgent Today */}
        {activeTab === "urgent" && (
          <div className="space-y-2">
            {urgentToday.length > 0 ? (
              urgentToday.map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <span className="text-sm font-medium text-white truncate">{entry.item.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.item.dueTime && (
                      <span className="text-xs text-white/50">{entry.item.dueTime}</span>
                    )}
                    <PriorityBadge priority={entry.item.priority} />
                    <ItemActions
                      itemId={entry.item.id}
                      title={entry.item.title}
                      isHabit={entry.isHabit}
                      onAction={onRefresh}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/50 text-center py-8">Nothing urgent today</p>
            )}
          </div>
        )}

        {/* This Week */}
        {activeTab === "week" && (
          <div className="space-y-2">
            {thisWeek.length > 0 ? (
              thisWeek.slice(0, 5).map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <div className="truncate">
                      <span className="text-sm font-medium text-white">{entry.item.title}</span>
                      <span className="text-xs text-white/50 ml-2">{entry.item.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/50 whitespace-nowrap">
                      {entry.item.dueDate && format(new Date(entry.item.dueDate), "EEE dd")}
                      {entry.item.dueTime && ` ${entry.item.dueTime}`}
                    </span>
                    <ItemActions itemId={entry.item.id} title={entry.item.title} onAction={onRefresh} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/50 text-center py-8">Nothing scheduled this week</p>
            )}
          </div>
        )}

        {/* Contract Alerts */}
        {activeTab === "contracts" && (
          <div className="space-y-2">
            {contractAlerts.length > 0 ? (
              contractAlerts.map((entry) => (
                <Link
                  href="/contracts"
                  key={entry.item.id}
                  className="flex items-center justify-between py-3 border-b border-white/10 last:border-0 hover:bg-white/5 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <div>
                      <span className="text-sm font-medium text-white">{entry.item.title}</span>
                      <p className="text-xs text-[#C4965A]">
                        Cancel before{" "}
                        {entry.contract.cancelBefore &&
                          format(new Date(entry.contract.cancelBefore), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-[#C4965A]/20 text-[#C4965A] border-[#C4965A]/30">
                    {entry.contract.monthlyCost?.toFixed(2)}/mo
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-white/50 text-center py-8">No contract alerts</p>
            )}
          </div>
        )}

        {/* In Progress */}
        {activeTab === "progress" && (
          <div className="space-y-2">
            {inProgress.length > 0 ? (
              inProgress.map((entry) => (
                <Link
                  href={`/tasks/${entry.item.id}`}
                  key={entry.item.id}
                  className="block py-3 border-b border-white/10 last:border-0 hover:bg-white/5 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {entry.owner && (
                        <FamilyBadge
                          name={entry.owner.name}
                          color={entry.owner.color}
                          avatar={entry.owner.avatar}
                        />
                      )}
                      <span className="text-sm font-medium text-white truncate">{entry.item.title}</span>
                    </div>
                    <PriorityBadge priority={entry.item.priority} />
                  </div>
                  {entry.latestComment && (
                    <p className="text-xs text-white/40 mt-1 ml-8 italic truncate">
                      &ldquo;{entry.latestComment.content}&rdquo;
                      <span className="ml-1 text-[10px]">
                        {entry.latestComment.createdAt &&
                          format(new Date(entry.latestComment.createdAt), "dd MMM")}
                      </span>
                    </p>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-sm text-white/50 text-center py-8">No tracking tasks</p>
            )}
          </div>
        )}
      </div>

      {/* Tab Icons Below Card — light background */}
      <div className="flex items-center justify-around mt-5 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center gap-1.5 min-w-[65px]"
          >
            <div
              className={`w-[56px] h-[56px] rounded-[16px] flex items-center justify-center transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#5B8A72] shadow-soft"
                  : "bg-sage-100"
              }`}
            >
              <tab.icon
                className={`h-6 w-6 ${
                  activeTab === tab.id ? "text-white" : "text-sage-700/60"
                }`}
              />
            </div>
            <span
              className={`text-[11px] font-medium ${
                activeTab === tab.id ? "text-sage-900" : "text-sage-700/50"
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
