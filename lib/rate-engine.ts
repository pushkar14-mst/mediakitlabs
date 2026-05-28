import { BenchmarkData, RateInputs, RateBreakdown, RateResult } from "@/types";

/**
 * Rounds a number to the nearest 500 for clean INR display.
 * @param value - Raw calculated rate value
 */
function roundToNearest500(value: number): number {
  return Math.round(value / 500) * 500;
}

/**
 * Calculates engagement rate boost multiplier.
 * Every point above 3% adds 8% to the rate.
 * ER below 3% applies a softer penalty (half the boost rate).
 * @param er - Engagement rate as a percentage e.g. 4.2
 */
function calcERBoost(er: number): number {
  const delta = er - 3;
  if (delta >= 0) return 1 + delta * 0.08;
  return 1 + delta * 0.04;
}

/**
 * Calculates follower-adjusted CPM in INR.
 * Non-linear scale — nano creators have higher CPM per follower
 * due to tighter audience engagement, mega creators have lower.
 * @param followers - Total follower count
 * @param baseCpm - Base CPM value from benchmark config
 */
function calcBaseCpm(followers: number, baseCpm: number): number {
  if (followers < 10_000) return baseCpm * 1.4;
  if (followers < 50_000) return baseCpm * 1.15;
  if (followers < 200_000) return baseCpm * 1.0;
  if (followers < 1_000_000) return baseCpm * 0.9;
  return baseCpm * 0.75;
}

/**
 * Formats a niche key into a human-readable label.
 * @param niche - Niche key from RateInputs
 */
function formatNiche(niche: string): string {
  return niche.charAt(0).toUpperCase() + niche.slice(1);
}

/**
 * Core rate calculation engine.
 * Formula: base = followers × CPM, raw = base × niche × platform × city × deliverable × ER boost.
 * Outputs floor (0.65×), mid (1×), and premium (1.5×) rates rounded to nearest ₹500.
 * @param inputs - Creator profile inputs from the calculator form
 * @param benchmarks - Benchmark multiplier config fetched from DB/cache
 */
export function calculateRate(
  inputs: RateInputs,
  benchmarks: BenchmarkData,
): RateResult {
  const { platform, niche, followers, engagementRate, city, deliverable } =
    inputs;

  const nicheMult = benchmarks.nicheMults[niche];
  const platformMult = benchmarks.platformMults[platform];
  const cityMult = benchmarks.cityMults[city];
  const deliverableMult = benchmarks.deliverableMults[deliverable];
  const erBoost = calcERBoost(engagementRate);
  const cpm = calcBaseCpm(followers, benchmarks.baseCpm);

  const base = followers * cpm;
  const raw =
    base * nicheMult * platformMult * cityMult * deliverableMult * erBoost;

  const breakdown: RateBreakdown = {
    base: Math.round(base),
    nicheMult,
    platformMult,
    cityMult,
    deliverableMult,
    erBoost: parseFloat(erBoost.toFixed(2)),
  };

  return {
    floorRate: roundToNearest500(raw * 0.65),
    midRate: roundToNearest500(raw),
    premiumRate: roundToNearest500(raw * 1.5),
    breakdown,
  };
}

/**
 * Lightweight client-side rate calculation for optimistic UI preview.
 * Runs synchronously in the browser before the API responds.
 * Uses the same formula as calculateRate but returns only the three rate values.
 * @param inputs - Creator profile inputs from the calculator form
 * @param benchmarks - Benchmark multiplier config already loaded on the client
 */
export function calculateRateClient(
  inputs: RateInputs,
  benchmarks: BenchmarkData,
): Pick<RateResult, "floorRate" | "midRate" | "premiumRate"> {
  const result = calculateRate(inputs, benchmarks);
  return {
    floorRate: result.floorRate,
    midRate: result.midRate,
    premiumRate: result.premiumRate,
  };
}

/**
 * Generates human-readable insight strings explaining why a rate was calculated.
 * Used in the "why this rate" section of the rate card output.
 * @param inputs - Creator profile inputs from the calculator form
 * @param benchmarks - Benchmark multiplier config fetched from DB/cache
 */
export function getRateInsights(
  inputs: RateInputs,
  benchmarks: BenchmarkData,
): string[] {
  const insights: string[] = [];

  const nicheMult = benchmarks.nicheMults[inputs.niche];
  if (nicheMult >= 2) {
    insights.push(
      `${formatNiche(inputs.niche)} niche commands a ${nicheMult}× premium in India`,
    );
  } else {
    insights.push(
      `${formatNiche(inputs.niche)} niche is at ${nicheMult}× baseline rate`,
    );
  }

  const avgER = 3.1;
  if (inputs.engagementRate > avgER) {
    insights.push(
      `Your ER (${inputs.engagementRate.toFixed(1)}%) is above the metro average (${avgER}%)`,
    );
  } else {
    insights.push(
      `Your ER (${inputs.engagementRate.toFixed(1)}%) is below the metro average (${avgER}%)`,
    );
  }

  const cityMult = benchmarks.cityMults[inputs.city];
  const cityLabel =
    inputs.city === "metro"
      ? "Metro"
      : inputs.city === "tier2"
        ? "Tier 2 city"
        : "Tier 3 city";
  insights.push(`${cityLabel} adds a ${cityMult}× location multiplier`);

  return insights;
}

/**
 * Returns a human-readable creator tier label based on follower count.
 * @param followers - Total follower count
 */
export function getCreatorTier(followers: number): string {
  if (followers < 10_000) return "Nano creator";
  if (followers < 50_000) return "Micro creator";
  if (followers < 200_000) return "Mid-tier creator";
  if (followers < 1_000_000) return "Macro creator";
  return "Mega creator";
}
