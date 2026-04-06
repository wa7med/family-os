"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "Family Life OS" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
