"use client";

import { useState, useMemo } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FamilyBadge } from "@/components/shared/family-badge";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const to = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data } = useFetch<Array<{ item: any; owner: any }>>(
    `/api/calendar?from=${from}&to=${to}`
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const itemsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    data?.forEach((entry) => {
      if (entry.item.dueDate) {
        const key = entry.item.dueDate;
        if (!map[key]) map[key] = [];
        map[key].push(entry);
      }
    });
    return map;
  }, [data]);

  const selectedItems = itemsByDate[format(selectedDate, "yyyy-MM-dd")] || [];

  const typeColors: Record<string, string> = {
    appointment: "bg-sage-500",
    task: "bg-sage-600",
    expense: "bg-[#C4965A]",
    contract: "bg-sage-800",
  };

  return (
    <div className="p-4 space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-sage-100"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5 text-sage-700" />
        </Button>
        <h2 className="text-lg font-bold text-sage-900">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-sage-100"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-5 w-5 text-sage-700" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <div key={day} className="text-xs font-medium text-sage-700/50 py-1">
            {day}
          </div>
        ))}

        {/* Calendar Grid */}
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayItems = itemsByDate[dateKey] || [];
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(day)}
              className={`
                relative p-1 h-12 rounded-lg text-sm transition-all duration-200
                ${isSelected ? "bg-sage-700 text-white shadow-soft" : ""}
                ${isToday(day) && !isSelected ? "bg-sage-100 font-bold text-sage-800" : ""}
                ${!isCurrentMonth ? "text-sage-700/30" : "text-sage-900"}
                ${!isSelected ? "hover:bg-sage-100" : ""}
              `}
            >
              {format(day, "d")}
              {dayItems.length > 0 && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayItems.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className={`h-1 w-1 rounded-full ${
                        isSelected
                          ? "bg-white"
                          : typeColors[item.item.type] || "bg-sage-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Items */}
      <div>
        <h3 className="font-semibold mb-2 text-sage-900">
          {format(selectedDate, "EEEE, dd MMMM")}
        </h3>
        {selectedItems.length > 0 ? (
          <div className="space-y-2 stagger-children">
            {selectedItems.map((entry: any) => (
              <Card key={entry.item.id} className="shadow-card">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        typeColors[entry.item.type] || "bg-sage-200"
                      }`}
                    />
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-sage-900">{entry.item.title}</p>
                      {entry.item.dueTime && (
                        <p className="text-xs text-sage-700/50">
                          {entry.item.dueTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-sage-200 text-sage-600">
                    {entry.item.type}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-sage-700/50">No items for this day</p>
        )}
      </div>
    </div>
  );
}
