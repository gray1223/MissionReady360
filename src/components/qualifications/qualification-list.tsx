"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isPast, differenceInDays } from "date-fns";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { QualificationForm } from "./qualification-form";
import type { UserQualification } from "@/lib/types/database";

const TYPE_LABELS: Record<string, string> = {
  military: "Military",
  faa_certificate: "FAA Certificate",
  faa_rating: "FAA Rating",
  faa_endorsement: "Endorsement",
  medical: "Medical",
  other: "Other",
};

interface QualificationListProps {
  qualifications: UserQualification[];
  userId: string;
}

export function QualificationList({
  qualifications,
  userId,
}: QualificationListProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<UserQualification | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserQualification | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(id: string) {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("user_qualifications").delete().eq("id", id);
    setConfirmDelete(null);
    setDeleting(false);
    router.refresh();
  }

  // Group by type
  const grouped = qualifications.reduce(
    (acc, q) => {
      const key = q.type || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    },
    {} as Record<string, UserQualification[]>
  );

  const typeOrder = [
    "faa_certificate",
    "faa_rating",
    "faa_endorsement",
    "military",
    "medical",
    "other",
  ];

  return (
    <>
      <div className="space-y-6">
        {typeOrder
          .filter((t) => grouped[t]?.length)
          .map((typeKey) => (
            <div key={typeKey}>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                {TYPE_LABELS[typeKey] || typeKey}
              </h3>
              <div className="space-y-2">
                {grouped[typeKey].map((q) => {
                  const expired =
                    q.expiry_date && isPast(parseISO(q.expiry_date));
                  const expiringSoon =
                    q.expiry_date &&
                    !expired &&
                    differenceInDays(parseISO(q.expiry_date), new Date()) <= 30;

                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-100">
                              {q.name}
                            </h4>
                            {!q.is_active && (
                              <Badge variant="default">Inactive</Badge>
                            )}
                            {expired && (
                              <Badge variant="danger">Expired</Badge>
                            )}
                            {expiringSoon && (
                              <Badge variant="warning">Expiring Soon</Badge>
                            )}
                            {q.is_active && !expired && !expiringSoon && (
                              <Badge variant="success">Active</Badge>
                            )}
                          </div>

                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            {q.issuing_authority && (
                              <span>Issued by: {q.issuing_authority}</span>
                            )}
                            {q.certificate_number && (
                              <span>#{q.certificate_number}</span>
                            )}
                            {q.issued_date && (
                              <span>
                                Issued:{" "}
                                {format(parseISO(q.issued_date), "MMM d, yyyy")}
                              </span>
                            )}
                            {q.expiry_date && (
                              <span className={expired ? "text-red-400" : expiringSoon ? "text-amber-400" : ""}>
                                {expired ? "Expired" : "Expires"}:{" "}
                                {format(
                                  parseISO(q.expiry_date),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            )}
                          </div>

                          {q.notes && (
                            <p className="mt-1.5 text-xs text-slate-500 italic">
                              {q.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(q)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => setConfirmDelete(q)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <QualificationForm
          open={!!editing}
          onClose={() => setEditing(null)}
          userId={userId}
          existing={editing}
        />
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Qualification"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">
            Are you sure you want to delete{" "}
            <strong>{confirmDelete?.name}</strong>? This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={() => confirmDelete && handleDelete(confirmDelete.id)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
