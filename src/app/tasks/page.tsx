"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { apiPut } from "@/hooks/use-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyBadge } from "@/components/shared/family-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckSquare, Plus, Circle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { TASK_CATEGORIES } from "@/lib/constants";

export default function TasksPage() {
  const { data, isLoading, mutate } = useFetch<Array<{ item: any; task: any; owner: any }>>(
    "/api/tasks"
  );
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 skeleton-premium rounded-[18px]" />
        ))}
      </div>
    );
  }

  const allTasks = data || [];
  const filtered = filter === "all"
    ? allTasks
    : allTasks.filter((e) => e.task.category === filter);

  const categories = ["all", ...TASK_CATEGORIES];

  const grouped: Record<string, typeof allTasks> = {};
  filtered.forEach((entry) => {
    const cat = entry.task.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sage-900">Tasks & Goals</h2>
        <Link href="/tasks/new">
          <Button size="sm" className="gap-1 bg-sage-600 hover:bg-sage-700 text-white">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              filter === cat
                ? "bg-sage-700 text-white shadow-soft"
                : "bg-sage-100 text-sage-700/60 hover:bg-sage-200"
            }`}
          >
            {cat === "all" ? "All" : cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Task List */}
      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([category, tasks]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-sage-700/50 mb-2 capitalize">
              {category.replace("_", " ")}
            </h3>
            <div className="space-y-1.5 stagger-children">
              {tasks.map((entry) => (
                <Card key={entry.item.id} className="shadow-card">
                  <CardContent className="p-3 flex items-center gap-3">
                    <button className="flex-shrink-0">
                      {entry.item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-sage-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-sage-200" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        entry.item.status === "completed"
                          ? "line-through text-sage-700/40"
                          : "font-medium text-sage-900"
                      }`}>
                        {entry.item.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {entry.owner && (
                        <FamilyBadge
                          name={entry.owner.name}
                          color={entry.owner.color}
                          avatar={entry.owner.avatar}
                        />
                      )}
                      {entry.task.isHabit && (
                        <Badge className="text-[10px] bg-sage-100 text-sage-600 border-sage-200">
                          {entry.task.frequency}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create tasks, goals and habits to track your progress"
        />
      )}
    </div>
  );
}
