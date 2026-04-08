"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { APPOINTMENT_CATEGORIES, PRIORITY_LEVELS } from "@/lib/constants";

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: members } = useFetch<any[]>("/api/family-members");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await apiPost("/api/appointments", {
        ownerId: form.get("ownerId"),
        title: form.get("title"),
        description: form.get("description") || null,
        dueDate: form.get("dueDate"),
        dueTime: form.get("dueTime") || null,
        priority: form.get("priority"),
        category: form.get("category"),
        location: form.get("location") || null,
      });
      router.push("/appointments");
    } catch (err) {
      alert("Failed to create appointment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-sage-100">
          <ArrowLeft className="h-5 w-5 text-sage-700" />
        </Button>
        <h2 className="text-xl font-bold text-sage-900">New Appointment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Title *</label>
          <Input name="title" placeholder="e.g. Dentist appointment" required />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Family Member *</label>
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
            <label className="text-sm font-medium mb-1 block text-sage-800">Date *</label>
            <Input name="dueDate" type="date" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Time</label>
            <Input name="dueTime" type="time" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Category</label>
            <Select
              name="category"
              options={APPOINTMENT_CATEGORIES.map((c) => ({
                value: c,
                label: c.charAt(0).toUpperCase() + c.slice(1),
              }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Priority</label>
            <Select
              name="priority"
              options={PRIORITY_LEVELS.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              }))}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Location</label>
          <Input name="location" placeholder="e.g. Dr. Schmidt, Berlin" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Notes</label>
          <Textarea name="description" placeholder="Additional notes..." />
        </div>

        <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700 text-white" disabled={loading}>
          {loading ? "Creating..." : "Create Appointment"}
        </Button>
      </form>
    </div>
  );
}
