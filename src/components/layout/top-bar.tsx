"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "Family Life OS" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[hsl(40,25%,98%)]/95 backdrop-blur-xl border-b border-[hsl(40,15%,88%)]">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold tracking-tight text-sage-900">{title}</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative hover:bg-sage-100">
            <Bell className="h-5 w-5 text-sage-700" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-sage-500 rounded-full" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="hover:bg-sage-100">
              <Settings className="h-5 w-5 text-sage-700" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
