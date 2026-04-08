"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyBadge } from "@/components/shared/family-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DollarSign, TrendingUp, Receipt, Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function MoneyPage() {
  const { data, isLoading } = useFetch<Array<{ item: any; expense: any; owner: any }>>(
    "/api/expenses"
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 skeleton-premium rounded-[18px]" />
        ))}
      </div>
    );
  }

  const expenses = data || [];
  const totalAmount = expenses.reduce((sum, e) => sum + (e.expense.amount || 0), 0);
  const taxDeductible = expenses
    .filter((e) => e.expense.taxDeductible)
    .reduce((sum, e) => sum + (e.expense.amount || 0), 0);

  return (
    <div className="p-4 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto text-[#C4965A] mb-1" />
            <p className="text-2xl font-bold text-sage-900">{totalAmount.toFixed(2)}</p>
            <p className="text-xs text-sage-700/50">Total Expenses</p>
          </CardContent>
        </Card>
        <Card className="shadow-card bg-sage-50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-sage-500 mb-1" />
            <p className="text-2xl font-bold text-sage-600">
              {taxDeductible.toFixed(2)}
            </p>
            <p className="text-xs text-sage-700/50">Tax Deductible</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <Link href="/money/new">
        <Button className="w-full gap-2 bg-sage-600 hover:bg-sage-700 text-white">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </Link>

      {/* Expense List */}
      <div>
        <h3 className="font-semibold mb-2 text-sage-900">Recent Expenses</h3>
        {expenses.length > 0 ? (
          <div className="space-y-2 stagger-children">
            {expenses.map((entry) => (
              <Link key={entry.item.id} href={`/money/${entry.item.id}/edit`}>
                <Card className="hover:bg-sage-50 transition-colors cursor-pointer shadow-card">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {entry.owner && (
                          <FamilyBadge
                            name={entry.owner.name}
                            color={entry.owner.color}
                            avatar={entry.owner.avatar}
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-sage-900">{entry.item.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {entry.expense.category && (
                              <Badge className="text-[10px] bg-sage-100 text-sage-600 border-sage-200">
                                {entry.expense.category}
                              </Badge>
                            )}
                            {entry.expense.taxDeductible && (
                              <Badge className="text-[10px] bg-sage-500 text-white">
                                tax deductible
                              </Badge>
                            )}
                            {entry.expense.taxCategory && (
                              <Badge variant="outline" className="text-[10px] border-sage-200 text-sage-600">
                                {entry.expense.taxCategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sage-900">
                          {entry.expense.amount?.toFixed(2)} {entry.expense.currency}
                        </p>
                        <p className="text-[10px] text-sage-700/50">
                          {entry.item.dueDate &&
                            format(new Date(entry.item.dueDate), "dd MMM")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Start tracking your expenses and tax deductions"
          />
        )}
      </div>
    </div>
  );
}
