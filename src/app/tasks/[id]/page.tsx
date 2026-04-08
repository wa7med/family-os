"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch, apiPost, apiPatch } from "@/hooks/use-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FamilyBadge } from "@/components/shared/family-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ArrowLeft, Send, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: taskData, mutate: mutateTask } = useFetch<any>(`/api/tasks/${id}`);
  const { data: commentsData, mutate: mutateComments } = useFetch<any[]>(
    `/api/items/${id}/comments`
  );
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await apiPost(`/api/items/${id}/comments`, { content: newComment.trim() });
      setNewComment("");
      mutateComments();
    } catch {
      alert("Failed to add comment");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await apiPatch(`/api/items/${id}`, { status });
      mutateTask();
    } catch {
      alert("Failed to update status");
    }
  }

  if (!taskData) {
    return (
      <div className="p-4">
        <div className="h-32 skeleton-premium rounded-[18px]" />
      </div>
    );
  }

  const { item, task, owner } = taskData;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-sage-100">
          <ArrowLeft className="h-5 w-5 text-sage-700" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate text-sage-900">{item?.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            {owner && (
              <FamilyBadge
                name={owner.name}
                color={owner.color}
                avatar={owner.avatar}
              />
            )}
            <PriorityBadge priority={item?.priority} />
            {task?.category && (
              <Badge className="text-[10px] bg-sage-100 text-sage-600 border-sage-200">
                {task.category}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[10px] ${
                item?.status === "active"
                  ? "border-sage-500 text-sage-600"
                  : item?.status === "completed"
                  ? "border-sage-500 text-sage-600"
                  : "border-sage-200 text-sage-700/50"
              }`}
            >
              {item?.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Description */}
      {item?.description && (
        <Card className="shadow-card">
          <CardContent className="pt-4">
            <p className="text-sm text-sage-700/60">{item.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {item?.status === "active" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-sage-600 hover:bg-sage-700 text-white"
            onClick={() => handleStatusChange("completed")}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-destructive border-destructive hover:bg-destructive/5"
            onClick={() => handleStatusChange("cancelled")}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}

      {/* Activity Log */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-sage-900">
            <MessageSquare className="h-4 w-4 text-sage-500" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add comment */}
          <div className="flex gap-2 mb-4">
            <Textarea
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewComment(e.target.value)
              }
              placeholder="Add an update..."
              className="min-h-[60px] text-sm"
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={sending || !newComment.trim()}
              className="self-end bg-sage-600 hover:bg-sage-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments list */}
          {commentsData && commentsData.length > 0 ? (
            <div className="space-y-3">
              {commentsData.map((comment: any) => (
                <div
                  key={comment.id}
                  className="border-l-2 border-sage-300 pl-3 py-1"
                >
                  <p className="text-sm text-sage-900">{comment.content}</p>
                  <p className="text-[10px] text-sage-700/50 mt-0.5">
                    {comment.createdAt &&
                      format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}{" "}
                    ({formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sage-700/50 text-center py-4">
              No activity yet. Add the first update above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
