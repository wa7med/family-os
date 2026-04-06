"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFetch, apiPatch, apiDelete } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Trash2 } from "lucide-react";
import { EXPENSE_CATEGORIES, TAX_CATEGORIES } from "@/lib/constants";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useFetch<{ item: any; expense: any; owner: any }>(
    `/api/expenses/${id}`
  );
  const { data: members } = useFetch<any[]>("/api/family-members");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taxDeductible, setTaxDeductible] = useState(false);

  useEffect(() => {
    if (data?.expense) {
      setTaxDeductible(!!data.expense.taxDeductible);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Expense not found</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await apiPatch(`/api/expenses/${id}`, {
        title: form.get("title"),
        ownerId: form.get("ownerId"),
        amount: parseFloat(form.get("amount") as string),
        currency: form.get("currency") || "EUR",
        dueDate: form.get("dueDate"),
        category: form.get("category"),
        paymentAccount: form.get("paymentAccount") || null,
        taxDeductible,
        taxCategory: taxDeductible ? form.get("taxCategory") : null,
      });
      router.push("/money");
    } catch (err) {
      alert("Failed to update expense");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`/api/expenses/${id}`);
      router.push("/money");
    } catch (err) {
      alert("Failed to delete expense");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Edit Expense</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <Input name="title" defaultValue={data.item.title} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Amount *</label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              defaultValue={data.expense.amount}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Currency</label>
            <Select
              name="currency"
              defaultValue={data.expense.currency || "EUR"}
              options={[
                { value: "EUR", label: "EUR" },
                { value: "USD", label: "USD" },
                { value: "GBP", label: "GBP" },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Family Member *</label>
          <Select
            name="ownerId"
            required
            defaultValue={data.item.ownerId}
            options={
              members?.map((m: any) => ({ value: m.id, label: m.name })) || []
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Date</label>
            <Input name="dueDate" type="date" defaultValue={data.item.dueDate || ""} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select
              name="category"
              defaultValue={data.expense.category || ""}
              options={EXPENSE_CATEGORIES.map((c) => ({
                value: c,
                label: c.charAt(0).toUpperCase() + c.slice(1),
              }))}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Payment Account</label>
          <Input
            name="paymentAccount"
            defaultValue={data.expense.paymentAccount || ""}
            placeholder="e.g. Main Account, Credit Card"
          />
        </div>

        {/* Tax Deductible Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Tax Deductible?</label>
          <button
            type="button"
            onClick={() => setTaxDeductible(!taxDeductible)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              taxDeductible ? "bg-green-500" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                taxDeductible ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        {taxDeductible && (
          <div>
            <label className="text-sm font-medium mb-1 block">Tax Category</label>
            <Select
              name="taxCategory"
              defaultValue={data.expense.taxCategory || ""}
              options={TAX_CATEGORIES.map((c) => ({
                value: c,
                label: c.replace("_", " "),
              }))}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-background rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mb-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Delete Expense</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete &quot;{data.item.title}&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
