"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  FileText,
  RefreshCw,
  CreditCard,
  Users,
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
    icon: RefreshCw,
    color: "bg-indigo-500",
  },
  {
    title: "Money",
    description: "Track expenses and income",
    href: "/money",
    icon: CreditCard,
    color: "bg-green-500",
  },
  {
    title: "Family",
    description: "Manage family members",
    href: "/family",
    icon: Users,
    color: "bg-purple-500",
  },
];

export default function ManagementPage() {
  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-sage-900 mb-6">Management</h1>

      {/* Main Management Cards */}
      <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}
