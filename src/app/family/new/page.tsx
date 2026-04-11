"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { FAMILY_ROLES, SEX_OPTIONS, FAMILY_COLORS, ROLE_AVATARS, SEX_AVATARS } from "@/lib/constants";

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSex, setSelectedSex] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const role = form.get("role") as string;
    const sex = form.get("sex") as string;

    try {
      await apiPost("/api/family-members", {
        name: form.get("name"),
        role,
        sex: sex || null,
        dateOfBirth: form.get("dateOfBirth") || null,
        color: FAMILY_COLORS[role] || "#6B7280",
        avatar: selectedAvatar || ROLE_AVATARS[role] || "🧑",
      });
      router.push("/family");
    } catch (err) {
      alert("Failed to add family member");
    } finally {
      setLoading(false);
    }
  }

  function getAvailableAvatars(role: string): string[] {
    const roleLower = role.toLowerCase();
    if (["son", "daughter"].includes(roleLower)) {
      return roleLower === "son" ? ["👦"] : ["👧"];
    }
    if (["grandfather", "grandmother", "husband", "wife", "uncle", "aunt"].includes(roleLower)) {
      return roleLower.includes("father") || roleLower === "husband" || roleLower === "uncle" ? ["👨"] : ["👩"];
    }
    if (selectedSex === "male") return ["👨", "👦"];
    if (selectedSex === "female") return ["👩", "👧"];
    return [ROLE_AVATARS[role] || "🧑"];
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-sage-100">
          <ArrowLeft className="h-5 w-5 text-sage-700" />
        </Button>
        <h2 className="text-xl font-bold text-sage-900">Add Family Member</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Name *</label>
          <Input name="name" placeholder="e.g. Sarah" required />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Role *</label>
          <Select
            name="role"
            required
            options={FAMILY_ROLES.map((r) => ({
              value: r,
              label: r.charAt(0).toUpperCase() + r.slice(1),
            }))}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedRole(e.target.value);
              setSelectedAvatar("");
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Sex</label>
          <Select
            name="sex"
            options={SEX_OPTIONS.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedSex(e.target.value);
              setSelectedAvatar("");
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-sage-800">Date of Birth</label>
          <Input name="dateOfBirth" type="date" />
        </div>

        {/* Avatar Selection */}
        {selectedRole && (
          <div>
            <label className="text-sm font-medium mb-2 block text-sage-800">Avatar</label>
            <div className="flex items-center gap-3">
              {getAvailableAvatars(selectedRole).map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`inline-flex items-center justify-center h-14 w-14 rounded-full text-2xl transition-all ${
                    selectedAvatar === avatar || (selectedAvatar === "" && getAvailableAvatars(selectedRole).length === 1)
                      ? "ring-2 ring-offset-2 ring-sage-500 scale-110"
                      : "hover:scale-105 opacity-70"
                  }`}
                  style={{ backgroundColor: (FAMILY_COLORS[selectedRole] || "#6B7280") + "20" }}
                >
                  {avatar}
                </button>
              ))}
              {getAvailableAvatars(selectedRole).length === 1 && (
                <span className="text-sm text-sage-600 ml-2">
                  Auto-selected based on role
                </span>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {selectedRole && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sage-50 border border-sage-200">
            <span
              className="inline-flex items-center justify-center h-12 w-12 rounded-full text-2xl"
              style={{ backgroundColor: (FAMILY_COLORS[selectedRole] || "#6B7280") + "20" }}
            >
              {selectedAvatar || ROLE_AVATARS[selectedRole] || "🧑"}
            </span>
            <div className="text-sm">
              <p className="font-medium capitalize text-sage-900">{selectedRole}</p>
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: FAMILY_COLORS[selectedRole] || "#6B7280" }}
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700 text-white" disabled={loading}>
          {loading ? "Adding..." : "Add Member"}
        </Button>
      </form>
    </div>
  );
}
