"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { FAMILY_ROLES, SEX_OPTIONS, FAMILY_COLORS, ROLE_AVATARS } from "@/lib/constants";

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const role = form.get("role") as string;

    try {
      await apiPost("/api/family-members", {
        name: form.get("name"),
        role,
        sex: form.get("sex") || null,
        dateOfBirth: form.get("dateOfBirth") || null,
        color: FAMILY_COLORS[role] || "#6B7280",
        avatar: ROLE_AVATARS[role] || "🧑",
      });
      router.push("/family");
    } catch (err) {
      alert("Failed to add family member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Add Family Member</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Name *</label>
          <Input name="name" placeholder="e.g. Sarah" required />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Role *</label>
          <Select
            name="role"
            required
            options={FAMILY_ROLES.map((r) => ({
              value: r,
              label: r.charAt(0).toUpperCase() + r.slice(1),
            }))}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedRole(e.target.value)
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Sex</label>
          <Select
            name="sex"
            options={SEX_OPTIONS.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Date of Birth</label>
          <Input name="dateOfBirth" type="date" />
        </div>

        {/* Preview */}
        {selectedRole && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <span
              className="inline-flex items-center justify-center h-12 w-12 rounded-full text-2xl"
              style={{ backgroundColor: (FAMILY_COLORS[selectedRole] || "#6B7280") + "20" }}
            >
              {ROLE_AVATARS[selectedRole] || "🧑"}
            </span>
            <div className="text-sm">
              <p className="font-medium capitalize">{selectedRole}</p>
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: FAMILY_COLORS[selectedRole] || "#6B7280" }}
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Member"}
        </Button>
      </form>
    </div>
  );
}
