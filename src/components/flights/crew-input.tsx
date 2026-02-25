"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CREW_POSITIONS } from "@/lib/constants/mission-symbols";
import type { FlightFormData } from "@/lib/flights/validation";

interface CrewInputProps {
  control: Control<FlightFormData>;
  register: ReturnType<typeof import("react-hook-form").useForm<FlightFormData>>["register"];
}

export function CrewInput({ control, register }: CrewInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "crew_members",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Crew Members</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ name: "", position: "pilot", callsign: "" })}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-sm text-slate-500">No crew members added</p>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="flex-1">
            <Input {...register(`crew_members.${index}.name`)} placeholder="Name" />
          </div>
          <div className="w-40">
            <Select
              {...register(`crew_members.${index}.position`)}
              options={CREW_POSITIONS}
              placeholder="Position"
            />
          </div>
          <div className="w-24">
            <Input
              {...register(`crew_members.${index}.callsign`)}
              placeholder="C/S"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            className="mt-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
