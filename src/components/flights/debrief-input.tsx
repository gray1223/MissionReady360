"use client";

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  type FieldErrors,
} from "react-hook-form";
import { Plus, CheckCircle2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { STATUS_CONFIG } from "@/lib/constants/debrief";
import type { FlightFormData } from "@/lib/flights/validation";
import type { DebriefItemStatus } from "@/lib/types/database";

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

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

interface DebriefInputProps {
  control: Control<FlightFormData>;
  register: UseFormRegister<FlightFormData>;
  setValue: UseFormSetValue<FlightFormData>;
  watch: UseFormWatch<FlightFormData>;
  errors?: FieldErrors<FlightFormData>;
  extraCategories?: { value: string; label: string }[];
}

export function DebriefInput({ control, register, setValue, watch, errors, extraCategories }: DebriefInputProps) {
  const { fields, append } = useFieldArray({
    control,
    name: "debrief_items",
  });

  const allCategories = extraCategories
    ? [...DEBRIEF_CATEGORIES, ...extraCategories]
    : DEBRIEF_CATEGORIES;

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        const itemError = errors?.debrief_items?.[index]?.item?.message;
        const currentStatus = (watch(`debrief_items.${index}.status`) || "open") as DebriefItemStatus;
        const isResolved = currentStatus === "resolved";
        const statusConfig = STATUS_CONFIG[currentStatus];

        return (
          <div
            key={field.id}
            className={cn(
              "rounded-lg border p-3 space-y-3",
              isResolved
                ? "border-emerald-800/40 bg-emerald-900/10 opacity-75"
                : "border-slate-800 bg-slate-800/20"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Select
                  {...register(`debrief_items.${index}.category`)}
                  label="Category"
                  options={allCategories}
                />
                <div className="sm:col-span-2">
                  <Input
                    {...register(`debrief_items.${index}.item`)}
                    label="Item"
                    placeholder="What happened / what to discuss"
                    error={itemError}
                  />
                </div>
              </div>
              {/* Status toggle button */}
              <button
                type="button"
                onClick={() => {
                  const next: DebriefItemStatus = isResolved ? "open" : "resolved";
                  setValue(`debrief_items.${index}.status`, next, { shouldDirty: true });
                }}
                className={cn(
                  "mt-6 rounded-lg p-1.5 transition-colors",
                  isResolved
                    ? "text-emerald-400 hover:text-amber-400 hover:bg-slate-800"
                    : "text-slate-500 hover:text-emerald-400 hover:bg-slate-800"
                )}
                title={isResolved ? "Reopen item" : "Mark as resolved"}
              >
                {isResolved ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  {...register(`debrief_items.${index}.resolution`)}
                  label="Resolution / Action"
                  placeholder="How was it resolved or what action is needed"
                />
              </div>
              <div className="pb-0.5">
                <Badge variant={statusConfig.variant} className="whitespace-nowrap">
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ category: "", item: "", resolution: "", status: "open" })}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Debrief Item
      </Button>
    </div>
  );
}
