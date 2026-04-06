"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { CONTRACT_CATEGORIES } from "@/lib/constants";

export default function NewContractPage() {
  const router = useRouter();
  const { data: members } = useFetch<any[]>("/api/family-members");
  const [loading, setLoading] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await apiPost("/api/contracts", {
        ownerId: form.get("ownerId"),
        title: form.get("title"),
        provider: form.get("provider"),
        monthlyCost: parseFloat(form.get("monthlyCost") as string) || null,
        startDate: form.get("startDate") || null,
        endDate: form.get("endDate") || null,
        noticePeriodDays: parseInt(form.get("noticePeriodDays") as string) || null,
        category: form.get("category"),
        autoRenew,
        accountDeductionDay: parseInt(form.get("accountDeductionDay") as string) || null,
      });
      router.push("/contracts");
    } catch (err) {
      alert("Failed to create contract");
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
        <h2 className="text-xl font-bold">New Contract</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <Input name="title" placeholder="e.g. Vodafone Mobile" required />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Provider *</label>
          <Input name="provider" placeholder="e.g. Vodafone" required />
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
            <label className="text-sm font-medium mb-1 block">Monthly Cost</label>
            <Input name="monthlyCost" type="number" step="0.01" placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select
              name="category"
              options={CONTRACT_CATEGORIES.map((c) => ({
                value: c,
                label: c.charAt(0).toUpperCase() + c.slice(1),
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <Input name="startDate" type="date" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <Input name="endDate" type="date" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Notice Period (days)</label>
            <Input name="noticePeriodDays" type="number" placeholder="e.g. 90" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Deduction Day</label>
            <Input name="accountDeductionDay" type="number" min="1" max="31" placeholder="e.g. 1" />
          </div>
        </div>

        {/* Auto Renew Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Auto-renew?</label>
          <button
            type="button"
            onClick={() => setAutoRenew(!autoRenew)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              autoRenew ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                autoRenew ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Add Contract"}
        </Button>
      </form>
    </div>
  );
}
