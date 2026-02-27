"use client";

import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { FlightFormData } from "@/lib/flights/validation";

const DEBRIEF_CATEGORIES = [
  { value: "", label: "Category..." },
  { value: "safety", label: "Safety" },
  { value: "mission_execution", label: "Mission Execution" },
  { value: "crew_coordination", label: "Crew Coordination" },
  { value: "systems", label: "Systems" },
  { value: "weather", label: "Weather" },
  { value: "airspace", label: "Airspace" },
  { value: "procedures", label: "Procedures" },
  { value: "training", label: "Training" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

interface DebriefInputProps {
  control: Control<FlightFormData>;
  register: UseFormRegister<FlightFormData>;
}

export function DebriefInput({ control, register }: DebriefInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "debrief_items",
  });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-lg border border-slate-800 bg-slate-800/20 p-3 space-y-3"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select
                {...register(`debrief_items.${index}.category`)}
                label="Category"
                options={DEBRIEF_CATEGORIES}
              />
              <div className="sm:col-span-2">
                <Input
                  {...register(`debrief_items.${index}.item`)}
                  label="Item"
                  placeholder="What happened / what to discuss"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-6 rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Input
            {...register(`debrief_items.${index}.resolution`)}
            label="Resolution / Action"
            placeholder="How was it resolved or what action is needed"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ category: "", item: "", resolution: "" })}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Debrief Item
      </Button>
    </div>
  );
}
