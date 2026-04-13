"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Calendar, Ban, CalendarX2 } from "lucide-react";
import { CONTRACT_CATEGORIES, DURATION_OPTIONS } from "@/lib/constants";
import { addMonths, format, parseISO, subDays } from "date-fns";

export default function NewContractPage() {
  const router = useRouter();
  const { data: members } = useFetch<any[]>("/api/family-members");
  const [loading, setLoading] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [isOpenEnded, setIsOpenEnded] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState<number | null>(null);
  const [noticeType, setNoticeType] = useState<"1m" | "3m" | "anytime" | "custom">("anytime");
  const [customNoticeDays, setCustomNoticeDays] = useState<number | null>(null);

  // Calculate billing period (end date based on start date + duration)
  const billingEndDate = startDate && durationMonths && !isOpenEnded
    ? format(addMonths(parseISO(startDate), durationMonths), "yyyy-MM-dd")
    : null;

  // Calculate notice period in days
  function getNoticePeriodDays(): number | null {
    if (isOpenEnded) return null;
    switch (noticeType) {
      case "1m": return 30;
      case "3m": return 90;
      case "anytime": return 0;
      case "custom": return customNoticeDays || null;
      default: return null;
    }
  }

  // Calculate cancel deadline
  const cancelDeadline = billingEndDate && noticeType !== "anytime" && !isOpenEnded
    ? (() => {
        const days = getNoticePeriodDays();
        if (days === null || days === 0) return null;
        return format(subDays(parseISO(billingEndDate), days), "yyyy-MM-dd");
      })()
    : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const noticeDays = getNoticePeriodDays();
    const noticePeriodDays = isOpenEnded ? null : (noticeType === "anytime" ? 0 : noticeDays);

    try {
      await apiPost("/api/contracts", {
        ownerId: form.get("ownerId"),
        title: form.get("title"),
        provider: form.get("provider"),
        monthlyCost: parseFloat(form.get("monthlyCost" as string)) || null,
        startDate: startDate || null,
        endDate: isOpenEnded ? null : billingEndDate,
        minDurationMonths: isOpenEnded ? null : durationMonths,
        noticePeriodDays,
        category: form.get("category"),
        autoRenew: isOpenEnded ? false : autoRenew,
        isOpenEnded,
        accountDeductionDay: parseInt(form.get("accountDeductionDay" as string)) || null,
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
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-sage-100">
          <ArrowLeft className="h-5 w-5 text-sage-700" />
        </Button>
        <h2 className="text-xl font-bold text-sage-900">New Contract</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Title *</label>
          <Input name="title" placeholder="e.g. Vodafone Mobile" required />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Provider *</label>
          <Input name="provider" placeholder="e.g. Vodafone" required />
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
            <label className="text-sm font-medium mb-1 block text-sage-800">Monthly Cost</label>
            <Input name="monthlyCost" type="number" step="0.01" placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Category</label>
            <Select
              name="category"
              options={CONTRACT_CATEGORIES.map((c) => ({
                value: c,
                label: c.charAt(0).toUpperCase() + c.slice(1),
              }))}
            />
          </div>
        </div>

        {/* Disable Billing Period Checkbox */}
        <div className="bg-purple-50 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isOpenEnded}
              onChange={(e) => setIsOpenEnded(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-1"
            />
            <div>
              <p className="font-medium text-purple-900">Disable billing period</p>
              <p className="text-xs text-purple-600">For contracts with no end date (e.g. rent, gym membership). This disables duration, notice period, and auto-renew.</p>
            </div>
          </label>
        </div>

        {/* Billing Period Section */}
        <div className={`rounded-xl p-4 space-y-3 ${isOpenEnded ? "bg-gray-100 opacity-60" : "bg-sage-50"}`}>
          <div className="flex items-center gap-2 text-sage-700">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Billing Period</span>
            {isOpenEnded && (
              <Badge variant="outline" className="ml-auto text-[10px] border-gray-400 text-gray-500">
                <Ban className="h-3 w-3 mr-1" /> Disabled
              </Badge>
            )}
          </div>

          {isOpenEnded && (
            <div className="text-xs text-gray-500 bg-white/50 rounded-lg p-2 flex items-center gap-2">
              <CalendarX2 className="h-3 w-3" />
              No end date — contract continues until cancelled
            </div>
          )}

          {!isOpenEnded && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block text-sage-800">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-sage-800">Duration</label>
                  <Select
                    name="duration"
                    options={[
                      { value: "", label: "Select" },
                      ...DURATION_OPTIONS.map((d) => ({ value: d.value, label: d.label })),
                    ]}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setDurationMonths(e.target.value ? parseInt(e.target.value) : null);
                    }}
                  />
                </div>
              </div>

              {billingEndDate && (
                <div className="text-sm text-sage-600 bg-white rounded-lg p-3 border border-sage-200">
                  <span className="font-medium">Billing period: </span>
                  {startDate && format(parseISO(startDate), "dd MMM yyyy")} → {format(parseISO(billingEndDate), "dd MMM yyyy")}
                </div>
              )}
            </>
          )}
        </div>

        {/* Notice Period Section */}
        <div className={`rounded-xl p-4 space-y-3 ${isOpenEnded ? "bg-gray-100 opacity-60" : "bg-amber-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-amber-800">Cancellation Notice</label>
            {isOpenEnded && (
              <Badge variant="outline" className="text-[10px] border-gray-400 text-gray-500">
                <Ban className="h-3 w-3 mr-1" /> Disabled
              </Badge>
            )}
          </div>

          {isOpenEnded && (
            <div className="text-xs text-gray-500 bg-white/50 rounded-lg p-2 flex items-center gap-2">
              <Ban className="h-3 w-3" />
              No notice period — cancellation takes effect immediately
            </div>
          )}

          {!isOpenEnded && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNoticeType("1m")}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    noticeType === "1m"
                      ? "border-amber-500 bg-white text-amber-700 shadow-sm"
                      : "border-amber-200 bg-white/50 text-amber-600 hover:bg-white"
                  }`}
                >
                  1 month
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeType("3m")}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    noticeType === "3m"
                      ? "border-amber-500 bg-white text-amber-700 shadow-sm"
                      : "border-amber-200 bg-white/50 text-amber-600 hover:bg-white"
                  }`}
                >
                  3 months
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeType("anytime")}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    noticeType === "anytime"
                      ? "border-amber-500 bg-white text-amber-700 shadow-sm"
                      : "border-amber-200 bg-white/50 text-amber-600 hover:bg-white"
                  }`}
                >
                  Any time
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeType("custom")}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    noticeType === "custom"
                      ? "border-amber-500 bg-white text-amber-700 shadow-sm"
                      : "border-amber-200 bg-white/50 text-amber-600 hover:bg-white"
                  }`}
                >
                  Custom
                </button>
              </div>

              {noticeType === "custom" && (
                <div className="mt-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Days notice period"
                    value={customNoticeDays || ""}
                    onChange={(e) => setCustomNoticeDays(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              )}

              {noticeType === "anytime" && (
                <p className="text-xs text-amber-600 mt-1">
                  Cancellation takes effect at the end of the billing period
                </p>
              )}

              {noticeType === "1m" && billingEndDate && (
                <p className="text-xs text-amber-600 mt-1">
                  Cancel by {format(subDays(parseISO(billingEndDate), 30), "dd MMM yyyy")} to cancel at period end
                </p>
              )}

              {noticeType === "3m" && billingEndDate && (
                <p className="text-xs text-amber-600 mt-1">
                  Cancel by {format(subDays(parseISO(billingEndDate), 90), "dd MMM yyyy")} to cancel at period end
                </p>
              )}
            </>
          )}
        </div>

        <div className={`grid grid-cols-2 gap-3 ${isOpenEnded ? "opacity-60" : ""}`}>
          <div>
            <label className="text-sm font-medium mb-1 block text-sage-800">Deduction Day</label>
            <Input name="accountDeductionDay" type="number" min="1" max="31" placeholder="e.g. 1" disabled={isOpenEnded} />
          </div>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 pt-5">
              <label className="text-sm font-medium text-sage-800">Auto-renew?</label>
              {isOpenEnded && (
                <Badge variant="outline" className="text-[10px] border-gray-400 text-gray-500">
                  <Ban className="h-3 w-3 mr-1" /> N/A
                </Badge>
              )}
              {!isOpenEnded && (
                <button
                  type="button"
                  onClick={() => setAutoRenew(!autoRenew)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    autoRenew ? "bg-sage-500" : "bg-sage-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      autoRenew ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700 text-white" disabled={loading}>
          {loading ? "Creating..." : "Add Contract"}
        </Button>
      </form>
    </div>
  );
}
