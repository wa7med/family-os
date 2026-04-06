"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "Family Life OS" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hover:bg-muted">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full shadow-lg shadow-accent/50" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Settings className="h-5 w-5 text-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
