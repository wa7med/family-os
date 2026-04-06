"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "Family Life OS" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E5E7EB]">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold tracking-tight text-[#0B1830]">{title}</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative hover:bg-[#F0F1F3]">
            <Bell className="h-5 w-5 text-[#0B1830]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#21D07A] rounded-full" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="hover:bg-[#F0F1F3]">
              <Settings className="h-5 w-5 text-[#0B1830]" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
