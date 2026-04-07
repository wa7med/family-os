"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, DollarSign, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "#fab", icon: Plus, label: "Add", isFab: true },
  { href: "/money", icon: DollarSign, label: "Money" },
  { href: "/family", icon: Users, label: "Family" },
];

interface BottomNavProps {
  onFabClick: () => void;
}

export function BottomNav({ onFabClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 max-w-lg mx-auto px-4 pb-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[22px] shadow-lg">
          <div className="flex items-center justify-around py-2 px-2">
            {navItems.map((item) => {
              if (item.isFab) {
                return (
                  <button
                    key="fab"
                    onClick={onFabClick}
                    className="flex items-center justify-center -mt-6 h-14 w-14 rounded-full bg-[#032d42] text-white shadow-lg hover:bg-[#032d42]/90 transition-colors"
                  >
                    <Plus className="h-7 w-7" />
                  </button>
                );
              }

              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-xs transition-colors",
                    isActive
                      ? "text-[#032d42]"
                      : "text-[#032d42]/40 hover:text-[#032d42]/70"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
