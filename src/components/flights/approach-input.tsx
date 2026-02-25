"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { APPROACH_TYPES } from "@/lib/constants/mission-symbols";
import type { FlightFormData } from "@/lib/flights/validation";

interface ApproachInputProps {
  control: Control<FlightFormData>;
  register: ReturnType<typeof import("react-hook-form").useForm<FlightFormData>>["register"];
}

export function ApproachInput({ control, register }: ApproachInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "approaches",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Approaches</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ type: "", runway: "", airport: "" })}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-sm text-slate-500">No approaches logged</p>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="flex-1">
            <Select
              {...register(`approaches.${index}.type`)}
              options={APPROACH_TYPES}
              placeholder="Type"
            />
          </div>
          <div className="w-24">
            <Input {...register(`approaches.${index}.runway`)} placeholder="Rwy" />
          </div>
          <div className="w-24">
            <Input {...register(`approaches.${index}.airport`)} placeholder="ICAO" />
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
