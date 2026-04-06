"use client";

import { cn } from "@/lib/utils";

interface FamilyBadgeProps {
  name: string;
  color: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FamilyBadge({ name, color, avatar, size = "sm", className }: FamilyBadgeProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color + "20", color }}
        title={name}
      >
        {avatar || name.charAt(0)}
      </span>
      {size !== "sm" && (
        <span className="text-sm font-medium" style={{ color }}>
          {name}
        </span>
      )}
    </div>
  );
}
