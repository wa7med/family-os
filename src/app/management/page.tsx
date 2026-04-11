"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  FileText,
  ListChecks,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";

const managementItems = [
  {
    title: "Tasks",
    description: "Manage all your tasks and habits",
    href: "/tasks",
    icon: ClipboardList,
    color: "bg-sage-500",
  },
  {
    title: "Appointments",
    description: "Doctor, school, visa appointments",
    href: "/appointments",
    icon: Calendar,
    color: "bg-blue-500",
  },
  {
    title: "Contracts",
    description: "Subscriptions and contracts",
    href: "/contracts",
    icon: FileText,
    color: "bg-amber-500",
  },
  {
    title: "In Progress",
    description: "Track ongoing projects",
    href: "/in-progress",
    icon: ListChecks,
    color: "bg-indigo-500",
  },
  {
    title: "Money",
    description: "Track expenses and income",
    href: "/money",
    icon: CreditCard,
    color: "bg-green-500",
  },
];

const secondaryItems = [
  {
    title: "Family",
    description: "Manage family members",
    href: "/family",
    icon: Users,
  },
  {
    title: "Settings",
    description: "App settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function ManagementPage() {
  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-sage-900 mb-6">Management</h1>

      {/* Main Management Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {managementItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow h-full">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-sage-900">{item.title}</h3>
                <p className="text-xs text-sage-600 mt-1">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Secondary Links */}
      <div className="space-y-2">
        {secondaryItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-sage-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sage-900">{item.title}</h3>
                  <p className="text-xs text-sage-500">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
