"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyBadge } from "@/components/shared/family-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText, Plus, AlertTriangle } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import Link from "next/link";

export default function ContractsPage() {
  const { data, isLoading } = useFetch<Array<{ item: any; contract: any; owner: any }>>(
    "/api/contracts"
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const contracts = data || [];

  function getUrgencyColor(cancelBefore: string | null): string {
    if (!cancelBefore) return "text-muted-foreground";
    const days = differenceInDays(parseISO(cancelBefore), new Date());
    if (days < 0) return "text-destructive";
    if (days <= 7) return "text-destructive";
    if (days <= 30) return "text-amber-500";
    return "text-muted-foreground";
  }

  function getStatusBadge(contract: any) {
    if (!contract.endDate) return <Badge variant="secondary">Active</Badge>;
    const daysToEnd = differenceInDays(parseISO(contract.endDate), new Date());
    if (daysToEnd < 0) return <Badge variant="destructive">Expired</Badge>;
    if (daysToEnd <= 30) return <Badge className="bg-amber-500 text-white">Expiring</Badge>;
    return <Badge variant="secondary">Active</Badge>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Contracts</h2>
        <Link href="/contracts/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      {contracts.length > 0 ? (
        <div className="space-y-3">
          {contracts.map((entry) => (
            <Card key={entry.item.id}>
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
                      <p className="font-semibold">{entry.item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.contract.provider}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {entry.contract.monthlyCost?.toFixed(2)}/mo
                    </p>
                    {getStatusBadge(entry.contract)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t">
                  <div>
                    <span className="text-muted-foreground">Period: </span>
                    {entry.contract.startDate && format(parseISO(entry.contract.startDate), "MMM yy")}
                    {" - "}
                    {entry.contract.endDate && format(parseISO(entry.contract.endDate), "MMM yy")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category: </span>
                    {entry.contract.category}
                  </div>
                  {entry.contract.cancelBefore && (
                    <div className={`col-span-2 flex items-center gap-1 font-medium ${getUrgencyColor(entry.contract.cancelBefore)}`}>
                      <AlertTriangle className="h-3 w-3" />
                      Cancel before {format(parseISO(entry.contract.cancelBefore), "dd MMM yyyy")}
                      {" "}({differenceInDays(parseISO(entry.contract.cancelBefore), new Date())} days)
                    </div>
                  )}
                  {entry.contract.autoRenew && (
                    <Badge variant="outline" className="w-fit text-[10px]">
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
    </div>
  );
}
