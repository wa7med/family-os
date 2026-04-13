"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Palette, Database, Info, Bell } from "lucide-react";
import Link from "next/link";

const settingsItems = [
  {
    label: "Family Members",
    description: "Manage family members and profiles",
    icon: Users,
    href: "/family",
    color: "text-blue-500",
  },
  {
    label: "Appearance",
    description: "Theme and display preferences",
    icon: Palette,
    href: "/settings/appearance",
    color: "text-purple-500",
  },
  {
    label: "Notifications",
    description: "Email and notification settings",
    icon: Bell,
    href: "/settings/notifications",
    color: "text-sage-500",
  },
  {
    label: "Data & Storage",
    description: "Database info and backup",
    icon: Database,
    href: "/settings/data",
    color: "text-amber-500",
  },
  {
    label: "About",
    description: "Version and app info",
    icon: Info,
    href: "/settings/about",
    color: "text-gray-500",
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <div className="space-y-2">
        {settingsItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
