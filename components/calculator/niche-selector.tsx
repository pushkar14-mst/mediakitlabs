"use client";

import { Niche } from "@/types";
import { cn } from "@/lib/utils";
import { BenchmarkData } from "@/types";

const NICHE_LABELS: Record<Niche, string> = {
  finance: "Finance",
  tech: "Tech",
  lifestyle: "Lifestyle",
  food: "Food",
  fashion: "Fashion",
  fitness: "Fitness",
  gaming: "Gaming",
  travel: "Travel",
  education: "Education",
  beauty: "Beauty",
};

interface NicheSelectorProps {
  value: Niche;
  onChange: (value: Niche) => void;
  benchmarks: BenchmarkData | null;
}

/**
 * Renders a grid of niche pills with live multiplier values from benchmarks.
 * @param value - Currently selected niche
 * @param onChange - Callback fired when selection changes
 * @param benchmarks - Benchmark config used to display multiplier hints
 */
export function NicheSelector({
  value,
  onChange,
  benchmarks,
}: NicheSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Niche
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(NICHE_LABELS) as Niche[]).map((niche) => (
          <button
            key={niche}
            onClick={() => onChange(niche)}
            className={cn(
              "px-3 py-2 rounded-lg border text-xs text-left transition-colors flex justify-between items-center",
              value === niche
                ? "bg-primary/10 border-primary text-primary font-medium"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            <span>{NICHE_LABELS[niche]}</span>
            {benchmarks && (
              <span className="opacity-50 text-[10px]">
                {benchmarks.nicheMults[niche]}×
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
