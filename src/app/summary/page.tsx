"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface DashboardData {
  urgentToday: Array<{ item: any; owner: any; isHabit: boolean }>;
  thisWeek: Array<{ item: any; owner: any }>;
  thisMonth: Array<{ item: any; owner: any }>;
  contractAlerts: Array<{ item: any; contract: any; owner: any }>;
  finance: {
    monthlyExpenses: number;
    taxDeductibleTotal: number;
    monthlyContractCosts: number;
  };
  dailyTasks: Array<{ item: any; task: any; owner: any }>;
  inProgress: Array<{ item: any; task: any; owner: any; latestComment: any }>;
}

export default function SummaryPage() {
  const { data, isLoading } = useFetch<DashboardData>("/api/dashboard");

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 skeleton-premium rounded-[18px]" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Urgent Today",
      value: data?.urgentToday?.length || 0,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Due This Week",
      value: data?.thisWeek?.length || 0,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Due This Month",
      value: data?.thisMonth?.length || 0,
      icon: Calendar,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "In Progress",
      value: data?.inProgress?.length || 0,
      icon: RefreshCw,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Daily Tasks",
      value: data?.dailyTasks?.length || 0,
      icon: CheckCircle2,
      color: "text-sage-500",
      bgColor: "bg-sage-50",
    },
    {
      title: "Contract Alerts",
      value: data?.contractAlerts?.length || 0,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-sage-900 mb-2">Summary</h1>
      <p className="text-sm text-sage-600 mb-6">Your family life at a glance</p>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-sage-900">{stat.value}</p>
                  <p className="text-xs text-sage-500">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finance Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-3">Finance Overview</h2>
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sage-500" />
                <span className="text-sm text-sage-700">Monthly Spend</span>
              </div>
              <span className="font-bold text-sage-900">
                €{data?.finance?.monthlyExpenses?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-sage-700">Tax Deductible</span>
              </div>
              <span className="font-bold text-green-600">
                €{data?.finance?.taxDeductibleTotal?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <span className="text-sm text-sage-700">Contracts/mo</span>
              </div>
              <span className="font-bold text-amber-600">
                €{data?.finance?.monthlyContractCosts?.toFixed(2) || "0.00"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Focus */}
      {data?.urgentToday && data.urgentToday.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-sage-900 mb-3">Today&apos;s Focus</h2>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                {data.urgentToday.slice(0, 3).map((entry) => (
                  <div key={entry.item.id} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-sage-700 truncate flex-1">
                      {entry.item.title}
                    </span>
                  </div>
                ))}
                {data.urgentToday.length > 3 && (
                  <p className="text-xs text-sage-500 pl-6">
                    +{data.urgentToday.length - 3} more
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* In Progress Snapshot */}
      {data?.inProgress && data.inProgress.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-sage-900 mb-3">Ongoing Projects</h2>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                {data.inProgress.slice(0, 3).map((entry) => (
                  <div key={entry.item.id} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm text-sage-700 truncate flex-1">
                      {entry.item.title}
                    </span>
                    {entry.latestComment && (
                      <Badge variant="outline" className="text-[10px]">
                        Has update
                      </Badge>
                    )}
                  </div>
                ))}
                {data.inProgress.length > 3 && (
                  <p className="text-xs text-sage-500 pl-6">
                    +{data.inProgress.length - 3} more in progress
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
