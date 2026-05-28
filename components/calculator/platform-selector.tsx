"use client";

import { Platform } from "@/types";
import { cn } from "@/lib/utils";

const PLATFORMS: { value: Platform; label: string; sub: string }[] = [
  { value: "ig_reel", label: "Instagram reel", sub: "1.0×" },
  { value: "ig_post", label: "Instagram post", sub: "0.7×" },
  { value: "ig_story", label: "Instagram story", sub: "0.4×" },
  { value: "yt_long", label: "YouTube long", sub: "2.2×" },
  { value: "yt_short", label: "YouTube shorts", sub: "0.65×" },
];

interface PlatformSelectorProps {
  value: Platform;
  onChange: (value: Platform) => void;
}

/**
 * Renders a pill group for selecting the content platform.
 * Displays the platform multiplier as a visual hint.
 * @param value - Currently selected platform
 * @param onChange - Callback fired when selection changes
 */
export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Platform
      </p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-xs transition-colors",
              value === p.value
                ? "bg-primary/10 border-primary text-primary font-medium"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
