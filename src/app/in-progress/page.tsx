"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FamilyBadge } from "@/components/shared/family-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ListChecks, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface InProgressEntry {
  item: any;
  task: any;
  owner: any;
  latestComment: any;
}

export default function InProgressPage() {
  const { data, isLoading } = useFetch<InProgressEntry[]>("/api/dashboard");

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 skeleton-premium rounded-[18px]" />
        ))}
      </div>
    );
  }

  const inProgress = data?.inProgress || [];

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-sage-900 mb-2">In Progress</h1>
      <p className="text-sm text-sage-600 mb-6">Track your ongoing tasks and projects</p>

      {inProgress.length > 0 ? (
        <div className="space-y-3">
          {inProgress.map((entry) => (
            <Link key={entry.item.id} href={`/tasks/${entry.item.id}`}>
              <Card className="shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {entry.owner && (
                        <FamilyBadge
                          name={entry.owner.name}
                          color={entry.owner.color}
                          avatar={entry.owner.avatar}
                        />
                      )}
                      <span className="font-semibold text-sage-900 truncate">
                        {entry.item.title}
                      </span>
                    </div>
                    <PriorityBadge priority={entry.item.priority} />
                  </div>

                  {entry.latestComment && (
                    <div className="flex items-start gap-2 mt-2 p-2 bg-sage-50 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-sage-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-sage-600 italic line-clamp-2">
                        &ldquo;{entry.latestComment.content}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 text-xs text-sage-500">
                    <span>
                      Due: {entry.item.dueDate && format(parseISO(entry.item.dueDate), "dd MMM yyyy")}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-sage-200">
                      {entry.task?.category || "tracking"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="No tasks in progress"
          description="Tasks you're tracking will appear here"
        />
      )}
    </div>
  );
}
