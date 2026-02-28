"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "block w-full rounded-lg border bg-slate-800/50 px-3 py-2 text-sm text-slate-100 min-h-[88px]",
            "placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-red-500" : "border-slate-700",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
