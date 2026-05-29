"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlatformSelector } from "./platform-selector";
import { NicheSelector } from "./niche-selector";
import { FollowerSlider } from "./follower-slider";
import { ERSlider } from "./er-slider";
import { RateCardOutput } from "./rate-card-output";
import { useRate } from "@/hooks/useRate";
import { useBenchmarks } from "@/hooks/useBenchmarks";
import { useRateCards } from "@/hooks/useRateCards";
import { RateInputs, CityTier, Deliverable } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CITY_TIERS: { value: CityTier; label: string }[] = [
  { value: "metro", label: "Metro" },
  { value: "tier2", label: "Tier 2" },
  { value: "tier3", label: "Tier 3" },
];

const DELIVERABLES: { value: Deliverable; label: string }[] = [
  { value: "single", label: "1 post" },
  { value: "bundle", label: "Bundle (3)" },
  { value: "campaign", label: "Campaign" },
];

const DEFAULT_INPUTS: RateInputs = {
  platform: "ig_reel",
  niche: "lifestyle",
  followers: 50_000,
  engagementRate: 3.5,
  city: "metro",
  deliverable: "single",
};

/**
 * Root calculator component — wires all input selectors, sliders,
 * and the rate output together. Debounces inputs at 300ms before
 * firing the calculate API call. Handles save rate card action.
 */
export function RateCalculator() {
  const [inputs, setInputs] = useState<RateInputs>(DEFAULT_INPUTS);
  const [debouncedInputs] = useDebounce(inputs, 300);

  const { benchmarks } = useBenchmarks();
  const { calculate, isMutating, result, insights, tier } = useRate();
  const { saveCard, isSaving } = useRateCards();

  const handlePlatformChange = useCallback(
    (platform: RateInputs["platform"]) =>
      setInputs((p) => ({ ...p, platform })),
    [],
  );

  const handleNicheChange = useCallback(
    (niche: RateInputs["niche"]) => setInputs((p) => ({ ...p, niche })),
    [],
  );

  const handleFollowersChange = useCallback(
    (followers: number) => setInputs((p) => ({ ...p, followers })),
    [],
  );

  const handleERChange = useCallback(
    (engagementRate: number) => setInputs((p) => ({ ...p, engagementRate })),
    [],
  );

  const handleCityChange = useCallback(
    (city: CityTier) => setInputs((p) => ({ ...p, city })),
    [],
  );

  const handleDeliverableChange = useCallback(
    (deliverable: Deliverable) => setInputs((p) => ({ ...p, deliverable })),
    [],
  );

  useEffect(() => {
    if (benchmarks) {
      calculate(debouncedInputs);
    }
  }, [debouncedInputs, benchmarks, calculate]);

  /**
   * Saves the current rate card result to the user's account.
   */
  const handleSave = useCallback(async () => {
    if (!result) return;

    try {
      await saveCard({
        ...inputs,
        floorRate: result.floorRate,
        midRate: result.midRate,
        premiumRate: result.premiumRate,
      });
      toast.success("Rate card saved");
    } catch {
      toast.error("Failed to save");
    }
  }, [result, inputs, saveCard]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-5xl mx-auto">
      {/* Left — inputs */}
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <PlatformSelector
            value={inputs.platform}
            onChange={handlePlatformChange}
          />

          <Separator />

          <NicheSelector
            value={inputs.niche}
            onChange={handleNicheChange}
            benchmarks={benchmarks}
          />

          <Separator />

          <FollowerSlider
            value={inputs.followers}
            onChange={handleFollowersChange}
          />

          <ERSlider
            value={inputs.engagementRate}
            onChange={handleERChange}
          />

          <Separator />

          {/* City tier */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              City tier
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CITY_TIERS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleCityChange(c.value)}
                  className={cn(
                    "py-2 rounded-lg border text-xs text-center transition-colors",
                    inputs.city === c.value
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deliverable */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Deliverable
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DELIVERABLES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDeliverableChange(d.value)}
                  className={cn(
                    "py-2 rounded-lg border text-xs text-center transition-colors",
                    inputs.deliverable === d.value
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right — output */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <RateCardOutput
              result={result}
              insights={insights}
              tier={tier}
              isMutating={isMutating}
            />
          </CardContent>
        </Card>

        {result ? (
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save rate card"}
            </Button>
            <Button variant="outline" className="flex-1">
              Download PDF
            </Button>
            <Button variant="outline" className="flex-1">
              Email to brand
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
