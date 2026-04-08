"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyBadge } from "@/components/shared/family-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar, Plus, MapPin, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function AppointmentsPage() {
  const { data, isLoading } = useFetch<Array<{ item: any; appointment: any; owner: any }>>(
    "/api/appointments"
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 skeleton-premium rounded-[18px]" />
        ))}
      </div>
    );
  }

  const appointments = data || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sage-900">Appointments</h2>
        <Link href="/appointments/new">
          <Button size="sm" className="gap-1 bg-sage-600 hover:bg-sage-700 text-white">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-2 stagger-children">
          {appointments.map((entry) => (
            <Card key={entry.item.id} className="shadow-card border-border">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {entry.owner && (
                      <FamilyBadge
                        name={entry.owner.name}
                        color={entry.owner.color}
                        avatar={entry.owner.avatar}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-sage-900">{entry.item.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-sage-700/50">
                        {entry.item.dueDate && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(entry.item.dueDate), "dd MMM")}
                            {entry.item.dueTime && ` ${entry.item.dueTime}`}
                          </span>
                        )}
                        {entry.appointment.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {entry.appointment.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {entry.appointment.category && (
                    <Badge variant="outline" className="text-[10px] border-sage-200 text-sage-600">
                      {entry.appointment.category}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments"
          description="Schedule doctor visits, meetings, and important dates"
        />
      )}
    </div>
  );
}
