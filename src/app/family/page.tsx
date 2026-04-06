"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import Link from "next/link";

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string | null;
}

export default function FamilyPage() {
  const { data, isLoading } = useFetch<FamilyMember[]>("/api/family-members");

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const members = data || [];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Family Members</h2>

      {members.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {members.map((member) => (
            <Link key={member.id} href={`/family/${member.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center text-3xl mb-2"
                    style={{
                      backgroundColor: member.color + "20",
                    }}
                  >
                    {member.avatar || member.name.charAt(0)}
                  </div>
                  <p className="font-semibold" style={{ color: member.color }}>
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No family members"
          description="Add family members to organize your life"
        />
      )}
    </div>
  );
}
