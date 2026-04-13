"use client";

import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Calendar, CheckSquare, DollarSign, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const quickAddOptions = [
  {
    type: "appointment",
    label: "Appointment",
    icon: Calendar,
    color: "bg-sage-500",
    href: "/appointments/new",
  },
  {
    type: "task",
    label: "Task",
    icon: CheckSquare,
    color: "bg-sage-600",
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
    color: "bg-sage-700",
    href: "/contracts/new",
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
                "hover:border-sage-200 hover:bg-sage-50 transition-all",
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
