"use client";

import { useState } from "react";
import { useFetch, apiPatch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyBadge } from "@/components/shared/family-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText, Plus, AlertTriangle, X, RefreshCw, Undo2 } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import Link from "next/link";

interface ContractEntry {
  item: any;
  contract: any;
  owner: any;
}

export default function ContractsPage() {
  const { data, isLoading, mutate } = useFetch<ContractEntry[]>("/api/contracts");
  const [selectedContract, setSelectedContract] = useState<ContractEntry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const contracts = data || [];

  function getUrgencyColor(cancelBefore: string | null): string {
    if (!cancelBefore) return "text-sage-700/50";
    const days = differenceInDays(parseISO(cancelBefore), new Date());
    if (days < 0) return "text-destructive";
    if (days <= 7) return "text-destructive";
    if (days <= 30) return "text-[#C4965A]";
    return "text-sage-700/50";
  }

  function getStatusBadge(entry: ContractEntry) {
    const { contract, item } = entry;
    if (item.status === "cancelled") {
      return <Badge variant="outline" className="text-sage-500 border-sage-300">Cancelled</Badge>;
    }
    if (contract.cancelledAt) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Cancel</Badge>;
    }
    if (!contract.endDate) return <Badge className="bg-sage-100 text-sage-700 border-sage-200">Active</Badge>;
    const daysToEnd = differenceInDays(parseISO(contract.endDate), new Date());
    if (daysToEnd < 0) return <Badge variant="destructive">Expired</Badge>;
    if (daysToEnd <= 30) return <Badge className="bg-[#C4965A] text-white border-[#C4965A]">Expiring</Badge>;
    return <Badge className="bg-sage-100 text-sage-700 border-sage-200">Active</Badge>;
  }

  async function handleContractAction(action: "cancel" | "requestCancel" | "undoCancel" | "renew") {
    if (!selectedContract) return;
    setActionLoading(true);

    try {
      await apiPatch("/api/contracts", {
        contractId: selectedContract.contract.id,
        itemId: selectedContract.item.id,
        action,
      });
      mutate();
      setSelectedContract(null);
    } catch (err) {
      alert(`Failed to ${action} contract`);
    } finally {
      setActionLoading(false);
    }
  }

  function isCancelled(entry: ContractEntry): boolean {
    return entry.item.status === "cancelled";
  }

  function hasPendingCancellation(entry: ContractEntry): boolean {
    return !!entry.contract.cancelledAt;
  }

  function showRenewButton(entry: ContractEntry): boolean {
    const { contract, item } = entry;
    if (item.status === "cancelled") return false;
    if (hasPendingCancellation(entry)) return false;
    if (!contract.autoRenew) return false;
    if (!contract.endDate) return false;
    const daysToEnd = differenceInDays(parseISO(contract.endDate), new Date());
    return daysToEnd < 0 || daysToEnd <= 30;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sage-900">Contracts</h2>
        <Link href="/contracts/new">
          <Button size="sm" className="gap-1 bg-sage-600 hover:bg-sage-700 text-white">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      {contracts.length > 0 ? (
        <div className="space-y-3 stagger-children">
          {contracts.map((entry) => (
            <Card
              key={entry.item.id}
              className={`shadow-card cursor-pointer transition-all hover:shadow-md ${
                isCancelled(entry) ? "opacity-60" : ""
              } ${hasPendingCancellation(entry) ? "border-amber-200" : ""}`}
              onClick={() => !isCancelled(entry) && setSelectedContract(entry)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sage-900">{entry.item.title}</p>
                      <p className="text-xs text-sage-700/50">
                        {entry.contract.provider}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sage-900">
                      {entry.contract.monthlyCost?.toFixed(2)}/mo
                    </p>
                    {getStatusBadge(entry)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-border">
                  <div className="text-sage-700/50">
                    <span className="text-sage-700/40">Period: </span>
                    {entry.contract.startDate && format(parseISO(entry.contract.startDate), "MMM yy")}
                    {" - "}
                    {entry.contract.endDate && format(parseISO(entry.contract.endDate), "MMM yy")}
                  </div>
                  <div className="text-sage-700/50">
                    <span className="text-sage-700/40">Category: </span>
                    {entry.contract.category}
                  </div>
                  {entry.contract.cancelBefore && !isCancelled(entry) && !hasPendingCancellation(entry) && (
                    <div className={`col-span-2 flex items-center gap-1 font-medium ${getUrgencyColor(entry.contract.cancelBefore)}`}>
                      <AlertTriangle className="h-3 w-3" />
                      Cancel before {format(parseISO(entry.contract.cancelBefore), "dd MMM yyyy")}
                      {" "}({differenceInDays(parseISO(entry.contract.cancelBefore), new Date())} days)
                    </div>
                  )}
                  {hasPendingCancellation(entry) && (
                    <div className="col-span-2 flex items-center gap-1 font-medium text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Ends {entry.contract.endDate && format(parseISO(entry.contract.endDate), "dd MMM yyyy")}
                    </div>
                  )}
                  {entry.contract.autoRenew && !isCancelled(entry) && !hasPendingCancellation(entry) && (
                    <Badge variant="outline" className="w-fit text-[10px] border-sage-200 text-sage-600">
                      Auto-renew
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          description="Track your contracts, subscriptions and their deadlines"
        />
      )}

      {/* Contract Action Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedContract(null)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-2 border-b">
              <p className="font-semibold text-sage-900">{selectedContract.item.title}</p>
              <p className="text-sm text-sage-500">{selectedContract.contract.provider}</p>
            </div>

            <div className="p-4 space-y-3">
              {hasPendingCancellation(selectedContract) ? (
                /* Pending Cancellation State */
                <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Cancellation requested
                  <span className="block mt-1">
                    Contract ends on {selectedContract.contract.endDate && format(parseISO(selectedContract.contract.endDate), "dd MMM yyyy")}
                  </span>
                </div>
              ) : (
                /* Active Contract State */
                <>
                  {selectedContract.contract.cancelBefore && (
                    <div className="text-sm text-sage-600 bg-sage-50 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      Cancel before {format(parseISO(selectedContract.contract.cancelBefore), "dd MMM yyyy")}
                      <span className="block text-xs mt-1">
                        {differenceInDays(parseISO(selectedContract.contract.cancelBefore), new Date())} days remaining
                      </span>
                    </div>
                  )}

                  <div className="text-sm space-y-1">
                    <p><span className="text-sage-500">Duration:</span> {selectedContract.contract.minDurationMonths} months</p>
                    <p><span className="text-sage-500">Notice period:</span> {selectedContract.contract.noticePeriodDays} days</p>
                    <p><span className="text-sage-500">Auto-renew:</span> {selectedContract.contract.autoRenew ? "Yes" : "No"}</p>
                  </div>
                </>
              )}

              <div className="pt-3 space-y-2">
                {hasPendingCancellation(selectedContract) ? (
                  /* Undo cancellation button */
                  <Button
                    className="w-full gap-2 bg-sage-600 hover:bg-sage-700 text-white"
                    onClick={() => handleContractAction("undoCancel")}
                    disabled={actionLoading}
                  >
                    <Undo2 className="h-4 w-4" />
                    Undo Cancellation
                  </Button>
                ) : (
                  /* Normal contract actions */
                  <>
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => handleContractAction("requestCancel")}
                      disabled={actionLoading}
                    >
                      <X className="h-4 w-4" />
                      Cancel at End of Period
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleContractAction("cancel")}
                      disabled={actionLoading}
                    >
                      <X className="h-4 w-4" />
                      Cancel Immediately
                    </Button>

                    {showRenewButton(selectedContract) && (
                      <Button
                        className="w-full gap-2 bg-sage-600 hover:bg-sage-700 text-white"
                        onClick={() => handleContractAction("renew")}
                        disabled={actionLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Renew for {selectedContract.contract.minDurationMonths} months
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
