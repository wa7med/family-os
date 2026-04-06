"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FamilyBadge } from "@/components/shared/family-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ItemActions } from "@/components/shared/item-actions";
import { AlertTriangle, Calendar, FileText, Loader } from "lucide-react";
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
    { id: "urgent" as TabType, icon: AlertTriangle, label: "Urgent", color: "text-red-500" },
    { id: "week" as TabType, icon: Calendar, label: "This Week", color: "text-blue-500" },
    { id: "contracts" as TabType, icon: FileText, label: "Contracts", color: "text-amber-500" },
    { id: "progress" as TabType, icon: Loader, label: "In Progress", color: "text-indigo-500" },
  ];

  return (
    <Card className="border-border bg-card rounded-[22px] overflow-hidden">
      {/* Segmented Pill Switcher */}
      <div className="p-4 pb-0">
        <div className="flex bg-muted rounded-[18px] p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-[16px] transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                  : "bg-transparent text-muted-foreground hover:text-secondary"
              }`}
            >
              <tab.icon className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] font-semibold whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 pt-4 min-h-[200px]">
        {/* Urgent Today */}
        {activeTab === "urgent" && (
          <div className="space-y-2">
            {urgentToday.length > 0 ? (
              urgentToday.map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <span className="text-sm font-medium text-foreground truncate">{entry.item.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.item.dueTime && (
                      <span className="text-xs text-muted-foreground">{entry.item.dueTime}</span>
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
              <p className="text-sm text-muted-foreground text-center py-8">Nothing urgent today</p>
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
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
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
                      <span className="text-sm font-medium text-foreground">{entry.item.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">{entry.item.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {entry.item.dueDate && format(new Date(entry.item.dueDate), "EEE dd")}
                      {entry.item.dueTime && ` ${entry.item.dueTime}`}
                    </span>
                    <ItemActions itemId={entry.item.id} title={entry.item.title} onAction={onRefresh} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Nothing scheduled this week</p>
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
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded-xl transition-colors"
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
                      <span className="text-sm font-medium text-foreground">{entry.item.title}</span>
                      <p className="text-xs text-[#F4B400]">
                        Cancel before{" "}
                        {entry.contract.cancelBefore &&
                          format(new Date(entry.contract.cancelBefore), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-[#F4B400]/20 text-[#F4B400] border-[#F4B400]/30">
                    {entry.contract.monthlyCost?.toFixed(2)}/mo
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No contract alerts</p>
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
                  className="block py-3 border-b border-border last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded-xl transition-colors"
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
                      <span className="text-sm font-medium text-foreground truncate">{entry.item.title}</span>
                    </div>
                    <PriorityBadge priority={entry.item.priority} />
                  </div>
                  {entry.latestComment && (
                    <p className="text-xs text-muted-foreground mt-1 ml-8 italic truncate">
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
              <p className="text-sm text-muted-foreground text-center py-8">No tracking tasks</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
