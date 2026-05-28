"use client";

import { Slider } from "@/components/ui/slider";

interface FollowerSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Formats a follower count into a human-readable Indian number format.
 * e.g. 250000 → "2.5L", 1000 → "1K"
 * @param n - Raw follower count
 */
function formatFollowers(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

/**
 * Slider input for follower count with Indian number format display.
 * Range: 1K to 50L with logarithmic-friendly step size.
 * @param value - Current follower count
 * @param onChange - Callback fired on slider change
 */
export function FollowerSlider({ value, onChange }: FollowerSliderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Followers
        </p>
        <span className="text-sm font-medium">{formatFollowers(value)}</span>
      </div>
      <Slider
        min={1000}
        max={5_000_000}
        step={1000}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>1K</span>
        <span>50L</span>
      </div>
    </div>
  );
}
