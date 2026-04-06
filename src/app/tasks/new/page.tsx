"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { TASK_CATEGORIES, PRIORITY_LEVELS } from "@/lib/constants";

export default function NewTaskPage() {
  const router = useRouter();
  const { data: members } = useFetch<any[]>("/api/family-members");
  const [loading, setLoading] = useState(false);
  const [isHabit, setIsHabit] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await apiPost("/api/tasks", {
        ownerId: form.get("ownerId"),
        title: form.get("title"),
        description: form.get("description") || null,
        dueDate: isHabit ? null : (form.get("dueDate") || null),
        startDate: isHabit ? (form.get("startDate") || null) : null,
        endDate: isHabit ? (form.get("endDate") || null) : null,
        priority: form.get("priority"),
        category: form.get("category"),
        isHabit,
        frequency: isHabit ? form.get("frequency") : null,
      });
      router.push("/tasks");
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">New Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <Input name="title" placeholder="e.g. Learn Kubernetes" required />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Family Member *</label>
          <Select
            name="ownerId"
            required
            options={
              members?.map((m: any) => ({ value: m.id, label: m.name })) || []
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select
              name="category"
              options={TASK_CATEGORIES.map((c) => ({
                value: c,
                label: c.replace("_", " "),
              }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Priority</label>
            <Select
              name="priority"
              options={PRIORITY_LEVELS.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              }))}
            />
          </div>
        </div>

        {/* Habit Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Is this a habit?</label>
          <button
            type="button"
            onClick={() => setIsHabit(!isHabit)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              isHabit ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                isHabit ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        {isHabit && (
          <div>
            <label className="text-sm font-medium mb-1 block">Frequency</label>
            <Select
              name="frequency"
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </div>
        )}

        {isHabit ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Input name="startDate" type="date" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date (optional)</label>
              <Input name="endDate" type="date" />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium mb-1 block">Due Date</label>
            <Input name="dueDate" type="date" />
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-1 block">Notes</label>
          <Textarea name="description" placeholder="Additional notes..." />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </div>
  );
}
