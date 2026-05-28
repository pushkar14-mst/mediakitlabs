"use client";

import { Slider } from "@/components/ui/slider";

interface ERSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Slider input for engagement rate percentage.
 * Range: 0.5% to 15% with 0.1 step precision.
 * Displays a contextual label (low/avg/good/excellent) based on value.
 * @param value - Current engagement rate as a percentage
 * @param onChange - Callback fired on slider change
 */
export function ERSlider({ value, onChange }: ERSliderProps) {
  function getERLabel(er: number): string {
    if (er < 1.5) return "Low";
    if (er < 3) return "Average";
    if (er < 6) return "Good";
    return "Excellent";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Engagement rate
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {getERLabel(value)}
          </span>
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      </div>
      <Slider
        min={0.5}
        max={15}
        step={0.1}
        value={[value]}
        onValueChange={([v]) => onChange(parseFloat(v.toFixed(1)))}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0.5%</span>
        <span>15%</span>
      </div>
    </div>
  );
}
