"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { EXPENSE_CATEGORIES, TAX_CATEGORIES } from "@/lib/constants";

export default function NewExpensePage() {
  const router = useRouter();
  const { data: members } = useFetch<any[]>("/api/family-members");
  const [loading, setLoading] = useState(false);
  const [taxDeductible, setTaxDeductible] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await apiPost("/api/expenses", {
        ownerId: form.get("ownerId"),
        title: form.get("title"),
        amount: parseFloat(form.get("amount") as string),
        currency: form.get("currency") || "EUR",
        dueDate: form.get("dueDate") || new Date().toISOString().split("T")[0],
        category: form.get("category"),
        paymentAccount: form.get("paymentAccount") || null,
        taxDeductible,
        taxCategory: taxDeductible ? form.get("taxCategory") : null,
      });
      router.push("/money");
    } catch (err) {
      alert("Failed to create expense");
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
        <h2 className="text-xl font-bold text-sage-900">New Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Title *</label>
          <Input name="title" placeholder="e.g. Laptop purchase" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Amount *</label>
            <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Currency</label>
            <Select
              name="currency"
              options={[
                { value: "EUR", label: "EUR" },
                { value: "USD", label: "USD" },
                { value: "GBP", label: "GBP" },
              ]}
            />
          </div>
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
            <label className="text-sm font-medium mb-1 block text-sage-800">Date</label>
            <Input name="dueDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Category</label>
            <Select
              name="category"
              options={EXPENSE_CATEGORIES.map((c) => ({
                value: c,
                label: c.charAt(0).toUpperCase() + c.slice(1),
              }))}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Payment Account</label>
          <Input name="paymentAccount" placeholder="e.g. Main Account, Credit Card" />
        </div>

        {/* Tax Deductible Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-sage-800">Tax Deductible?</label>
          <button
            type="button"
            onClick={() => setTaxDeductible(!taxDeductible)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              taxDeductible ? "bg-sage-500" : "bg-sage-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                taxDeductible ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        {taxDeductible && (
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Tax Category</label>
            <Select
              name="taxCategory"
              options={TAX_CATEGORIES.map((c) => ({
                value: c,
                label: c.replace("_", " "),
              }))}
            />
          </div>
        )}

        <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700 text-white" disabled={loading}>
          {loading ? "Creating..." : "Add Expense"}
        </Button>
      </form>
    </div>
  );
}
