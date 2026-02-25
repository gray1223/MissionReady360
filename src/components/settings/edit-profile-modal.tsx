"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { BRANCHES, DUTY_STATUSES } from "@/lib/constants/branches";
import { RANKS } from "@/lib/constants/ranks";
import type { Profile, MilitaryBranch } from "@/lib/types/database";

interface EditProfileModalProps {
  profile: Profile;
  userId: string;
}

export function EditProfileModal({ profile, userId }: EditProfileModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [branch, setBranch] = useState(profile.branch || "");
  const [rank, setRank] = useState(profile.rank || "");
  const [dutyStatus, setDutyStatus] = useState(profile.duty_status || "");
  const [unit, setUnit] = useState(profile.unit || "");
  const [callsign, setCallsign] = useState(profile.callsign || "");

  const rankOptions = branch
    ? RANKS[branch as MilitaryBranch] || []
    : [];

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          branch: branch || null,
          rank: rank || null,
          duty_status: dutyStatus || null,
          unit: unit || null,
          callsign: callsign || null,
        })
        .eq("id", userId);

      if (updateError) throw updateError;
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Select
            label="Branch"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              setRank(""); // Reset rank when branch changes
            }}
            options={BRANCHES.map((b) => ({ value: b.value, label: b.label }))}
            placeholder="Select branch"
          />

          <Select
            label="Rank"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            options={rankOptions}
            placeholder={branch ? "Select rank" : "Select branch first"}
            disabled={!branch}
          />

          <Select
            label="Duty Status"
            value={dutyStatus}
            onChange={(e) => setDutyStatus(e.target.value)}
            options={DUTY_STATUSES}
            placeholder="Select status"
          />

          <Input
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., 62nd Airlift Wing"
          />

          <Input
            label="Callsign"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder="e.g., Maverick"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
