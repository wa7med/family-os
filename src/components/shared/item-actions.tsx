"use client";

import { useState, useRef } from "react";
import { apiPatch, apiPost } from "@/hooks/use-fetch";
import { Check, Clock, X, MoreVertical, CalendarDays, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemActionsProps {
  itemId: string;
  title?: string;
  isHabit?: boolean;
  onAction?: () => void;
}

// --- ItemActions: for Urgent Today & This Week (done, postpone popup, cancel) ---
export function ItemActions({ itemId, title, isHabit, onAction }: ItemActionsProps) {
  const [open, setOpen] = useState(false);
  const [showPostpone, setShowPostpone] = useState(false);
  const [loading, setLoading] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);

  async function doAction(payload: Record<string, any>) {
    setLoading(true);
    try {
      await apiPatch(`/api/items/${itemId}`, payload);
      onAction?.();
    } catch {
      alert("Failed to update item");
    } finally {
      setLoading(false);
      setOpen(false);
      setShowPostpone(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex-shrink-0 p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => { setOpen(false); setShowPostpone(false); }}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-background rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="px-4 pt-4 pb-2 border-b">
                <p className="text-sm font-semibold truncate">{title}</p>
              </div>
            )}

            {!showPostpone ? (
              <div className="p-2">
                <button
                  onClick={async () => {
                    if (isHabit) {
                      setLoading(true);
                      try {
                        await apiPost("/api/habits/complete", { itemId });
                        onAction?.();
                      } catch {
                        alert("Failed to complete habit");
                      } finally {
                        setLoading(false);
                        setOpen(false);
                      }
                    } else {
                      doAction({ status: "completed" });
                    }
                  }}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
                >
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">{isHabit ? "Done for Today" : "Mark as Done"}</span>
                </button>
                <button
                  onClick={() => setShowPostpone(true)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Postpone</span>
                </button>
                <button
                  onClick={() => doAction({ status: "cancelled" })}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <X className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Cancel Item</span>
                </button>
              </div>
            ) : (
              <div className="p-2">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Postpone to...
                </p>
                <button
                  onClick={() => doAction({ postponeDays: 1 })}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Tomorrow (+1 day)</span>
                </button>
                <button
                  onClick={() => doAction({ postponeDays: 7 })}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Next week (+7 days)</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-3">
                  <CalendarDays className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <input
                    ref={dateRef}
                    type="date"
                    className="flex-1 text-sm border rounded-lg px-3 py-2 bg-background"
                  />
                  <button
                    onClick={() => {
                      const val = dateRef.current?.value;
                      if (!val) { alert("Please pick a date"); return; }
                      doAction({ dueDate: val });
                    }}
                    disabled={loading}
                    className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Set
                  </button>
                </div>
                <button
                  onClick={() => setShowPostpone(false)}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Back</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// --- DailyFocusActions: for Daily Focus (complete today, not complete, cancel) ---
interface DailyFocusActionsProps {
  itemId: string;
  title?: string;
  onAction?: () => void;
}

export function DailyFocusActions({ itemId, title, onAction }: DailyFocusActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doAction(payload: Record<string, any>) {
    setLoading(true);
    try {
      await apiPatch(`/api/items/${itemId}`, payload);
      onAction?.();
    } catch {
      alert("Failed to update item");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex-shrink-0 p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-background rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="px-4 pt-4 pb-2 border-b">
                <p className="text-sm font-semibold truncate">{title}</p>
              </div>
            )}
            <div className="p-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await apiPost("/api/habits/complete", { itemId });
                    onAction?.();
                  } catch {
                    alert("Failed to complete habit");
                  } finally {
                    setLoading(false);
                    setOpen(false);
                  }
                }}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
              >
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Complete Today</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Not Complete</span>
              </button>
              <button
                onClick={() => doAction({ status: "cancelled" })}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <X className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">Cancel Task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
