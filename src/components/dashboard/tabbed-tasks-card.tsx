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
    <Card className="bg-[#0f1729] border-gray-800">
      {/* Tab Icons */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#1a2332] rounded-t-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-[#0f1729] shadow-lg"
                : "bg-transparent hover:bg-[#0f1729]/50"
            }`}
          >
            <tab.icon className={`h-5 w-5 mb-1 ${activeTab === tab.id ? tab.color : "text-gray-400"}`} />
            <span className={`text-[10px] font-medium ${activeTab === tab.id ? "text-white" : "text-gray-400"}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <CardContent className="p-4 min-h-[200px]">
        {/* Urgent Today */}
        {activeTab === "urgent" && (
          <div className="space-y-2">
            {urgentToday.length > 0 ? (
              urgentToday.map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
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
                      <span className="text-xs text-gray-400">{entry.item.dueTime}</span>
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
              <p className="text-sm text-gray-400 text-center py-8">Nothing urgent today</p>
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
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
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
                      <span className="text-xs text-gray-400 ml-2">{entry.item.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {entry.item.dueDate && format(new Date(entry.item.dueDate), "EEE dd")}
                      {entry.item.dueTime && ` ${entry.item.dueTime}`}
                    </span>
                    <ItemActions itemId={entry.item.id} title={entry.item.title} onAction={onRefresh} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Nothing scheduled this week</p>
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
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 -mx-2 px-2 rounded"
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
                      <p className="text-xs text-amber-500">
                        Cancel before{" "}
                        {entry.contract.cancelBefore &&
                          format(new Date(entry.contract.cancelBefore), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {entry.contract.monthlyCost?.toFixed(2)}/mo
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No contract alerts</p>
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
                  className="block py-2 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 -mx-2 px-2 rounded"
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
                    <p className="text-xs text-gray-400 mt-1 ml-8 italic truncate">
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
              <p className="text-sm text-gray-400 text-center py-8">No tracking tasks</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
