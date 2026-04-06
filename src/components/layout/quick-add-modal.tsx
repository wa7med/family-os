"use client";

import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Calendar, CheckSquare, DollarSign, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const quickAddOptions = [
  {
    type: "appointment",
    label: "Appointment",
    icon: Calendar,
    color: "bg-blue-500",
    href: "/appointments/new",
  },
  {
    type: "task",
    label: "Task",
    icon: CheckSquare,
    color: "bg-green-500",
    href: "/tasks/new",
  },
  {
    type: "expense",
    label: "Expense",
    icon: DollarSign,
    color: "bg-amber-500",
    href: "/money/new",
  },
  {
    type: "contract",
    label: "Contract",
    icon: FileText,
    color: "bg-purple-500",
    href: "/contracts/new",
  },
  {
    type: "member",
    label: "Member",
    icon: Users,
    color: "bg-teal-500",
    href: "/family/new",
  },
];

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Quick Add</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="grid grid-cols-2 gap-3 pb-4">
          {quickAddOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => {
                onOpenChange(false);
                router.push(option.href);
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent",
                "hover:border-primary/20 hover:bg-accent transition-all",
                "active:scale-95"
              )}
            >
              <div className={cn("p-3 rounded-full text-white", option.color)}>
                <option.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
