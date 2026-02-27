"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import type { UserQualification } from "@/lib/types/database";

const QUAL_TYPES = [
  { value: "military", label: "Military Qualification" },
  { value: "faa_certificate", label: "FAA Certificate" },
  { value: "faa_rating", label: "FAA Rating" },
  { value: "faa_endorsement", label: "FAA Endorsement" },
  { value: "medical", label: "Medical Certificate" },
  { value: "other", label: "Other" },
];

interface QualificationFormProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  existing?: UserQualification;
}

export function QualificationForm({
  open,
  onClose,
  userId,
  existing,
}: QualificationFormProps) {
  const router = useRouter();
  const isEdit = !!existing;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(existing?.name || "");
  const [type, setType] = useState(existing?.type || "");
  const [issuingAuthority, setIssuingAuthority] = useState(
    existing?.issuing_authority || ""
  );
  const [certificateNumber, setCertificateNumber] = useState(
    existing?.certificate_number || ""
  );
  const [issuedDate, setIssuedDate] = useState(existing?.issued_date || "");
  const [expiryDate, setExpiryDate] = useState(existing?.expiry_date || "");
  const [isActive, setIsActive] = useState(existing?.is_active ?? true);
  const [notes, setNotes] = useState(existing?.notes || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !type) {
      setError("Name and type are required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const payload = {
        user_id: userId,
        name: name.trim(),
        type,
        issuing_authority: issuingAuthority || null,
        certificate_number: certificateNumber || null,
        issued_date: issuedDate || null,
        expiry_date: expiryDate || null,
        is_active: isActive,
        notes: notes || null,
      };

      if (isEdit && existing) {
        const { error: updateError } = await supabase
          .from("user_qualifications")
          .update(payload)
          .eq("id", existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_qualifications")
          .insert(payload);
        if (insertError) throw insertError;
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save qualification"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Qualification" : "Add Qualification"}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Name"
          placeholder="e.g. Private Pilot Certificate"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[{ value: "", label: "Select type..." }, ...QUAL_TYPES]}
        />

        <Input
          label="Issuing Authority"
          placeholder="e.g. FAA, USAF, Army"
          value={issuingAuthority}
          onChange={(e) => setIssuingAuthority(e.target.value)}
        />

        <Input
          label="Certificate / Document Number"
          placeholder="e.g. 1234567"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Issued Date"
            type="date"
            value={issuedDate}
            onChange={(e) => setIssuedDate(e.target.value)}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
          />
          Active / Current
        </label>

        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional details..."
          rows={2}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? "Update" : "Add Qualification"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
