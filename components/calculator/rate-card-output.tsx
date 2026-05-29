"use client";

import { memo } from "react";
import { RateResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RateCardOutputProps {
  result: Pick<RateResult, "floorRate" | "midRate" | "premiumRate"> | null;
  insights: string[];
  tier: string | null;
  isMutating: boolean;
}

/**
 * Formats a number into INR locale string.
 * @param n - Raw number value
 */
function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Displays the calculated rate card output with floor, recommended,
 * and premium tiers, market insights, and creator tier badge.
 * Shows skeletons while calculation is in flight.
 * @param result - Calculated rate values
 * @param insights - Human-readable explanation strings from rate engine
 * @param tier - Creator tier label e.g. "Micro creator"
 * @param isMutating - Whether a calculation is currently in flight
 */
export const RateCardOutput = memo(function RateCardOutput({
  result,
  insights,
  tier,
  isMutating,
}: RateCardOutputProps) {
  if (!result && !isMutating) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <p className="text-sm text-muted-foreground">
          Fill in your profile to see your rate
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tier ? (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your rate card
          </p>
          <Badge variant="secondary" className="text-xs">
            {tier}
          </Badge>
        </div>
      ) : null}

      {/* Rate tiers */}
      <div className="rounded-lg border border-border overflow-hidden">
        {result ? (
          <>
            <div className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">Floor rate</p>
                <p className="text-[10px] text-muted-foreground/60">
                  Don't go below this
                </p>
              </div>
              <p className="text-lg font-medium">
                {formatINR(result.floorRate)}
              </p>
            </div>

            <Separator />

            <div
              className={cn(
                "flex items-center justify-between p-4",
                "bg-primary/5",
              )}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">Recommended</p>
                  <Badge className="text-[10px] px-1.5 py-0">
                    sweet spot
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground/60">
                  Pitch this first
                </p>
              </div>
              <p className="text-xl font-medium text-primary">
                {formatINR(result.midRate)}
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">Premium rate</p>
                <p className="text-[10px] text-muted-foreground/60">
                  For exclusivity deals
                </p>
              </div>
              <p className="text-lg font-medium">
                {formatINR(result.premiumRate)}
              </p>
            </div>
          </>
        ) : isMutating ? (
          <div className="flex flex-col gap-px">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Insights */}
      {insights.length > 0 ? (
        <div className="rounded-lg border border-border p-4 flex flex-col gap-2">
          <p className="text-xs font-medium">Why this rate</p>
          <ul className="flex flex-col gap-1.5">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-xs text-muted-foreground">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
});
