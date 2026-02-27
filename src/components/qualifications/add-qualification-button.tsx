"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QualificationForm } from "./qualification-form";

interface AddQualificationButtonProps {
  userId: string;
}

export function AddQualificationButton({ userId }: AddQualificationButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Qualification
      </Button>
      <QualificationForm
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
      />
    </>
  );
}
