"use client";

import { useState } from "react";
import { useFetch, apiDelete } from "@/hooks/use-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CheckSquare, DollarSign, FileText, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function FamilyMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const [deleting, setDeleting] = useState(false);

  const { data: items } = useFetch<Array<{ item: any; owner: any }>>(
    `/api/items?owner=${memberId}`
  );

  const { data: members } = useFetch<any[]>("/api/family-members");
  const member = members?.find((m: any) => m.id === memberId);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${member?.name}"?\n\nThis will also delete all their appointments, tasks, expenses, and contracts.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiDelete(`/api/family-members/${memberId}`);
      router.push("/family");
    } catch (err) {
      alert("Failed to delete member");
      setDeleting(false);
    }
  }

  const groupedItems = {
    appointment: items?.filter((e) => e.item.type === "appointment") || [],
    task: items?.filter((e) => e.item.type === "task") || [],
    expense: items?.filter((e) => e.item.type === "expense") || [],
    contract: items?.filter((e) => e.item.type === "contract") || [],
  };

  const typeIcons: Record<string, any> = {
    appointment: Calendar,
    task: CheckSquare,
    expense: DollarSign,
    contract: FileText,
  };

  const typeColors: Record<string, string> = {
    appointment: "text-sage-600",
    task: "text-sage-500",
    expense: "text-[#C4965A]",
    contract: "text-sage-700",
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-sage-100">
          <ArrowLeft className="h-5 w-5 text-sage-700" />
        </Button>
        {member && (
          <div className="flex items-center gap-3 flex-1">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: member.color + "20" }}
            >
              {member.avatar || member.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: member.color }}>
                {member.name}
              </h2>
              <p className="text-sm text-sage-700/50 capitalize">{member.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Items by type */}
      {Object.entries(groupedItems).map(([type, typeItems]) => {
        if (typeItems.length === 0) return null;
        const Icon = typeIcons[type];

        return (
          <Card key={type} className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className={`flex items-center gap-2 text-base ${typeColors[type]}`}>
                <Icon className="h-4 w-4" />
                {type.charAt(0).toUpperCase() + type.slice(1)}s
                <Badge className="ml-auto bg-sage-100 text-sage-600 border-sage-200">
                  {typeItems.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeItems.map((entry) => (
                  <div
                    key={entry.item.id}
                    className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-sage-900">{entry.item.title}</span>
                    <span className="text-xs text-sage-700/50">
                      {entry.item.dueDate || ""}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
