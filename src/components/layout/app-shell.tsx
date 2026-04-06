"use client";

import { useState } from "react";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";
import { QuickAddModal } from "./quick-add-modal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <TopBar />
      <main className="pb-20">{children}</main>
      <BottomNav onFabClick={() => setQuickAddOpen(true)} />
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
