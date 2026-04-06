"use client";

import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS } from "@/lib/constants";

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;

  return (
    <Badge
      className="text-white text-[10px] px-1.5 py-0"
      style={{ backgroundColor: color }}
    >
      {priority}
    </Badge>
  );
}
