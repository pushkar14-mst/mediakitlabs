import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { RateInputs, RateResult } from "@/types";
import { useBenchmarks } from "./useBenchmarks";
import { calculateRateClient } from "@/lib/rate-engine";

/**
 * Manages rate calculation state including optimistic client-side preview
 * and authoritative server result via API.
 * Exposes a debounce-friendly trigger and both optimistic + confirmed results.
 */
export function useRate() {
  const { benchmarks } = useBenchmarks();
  const [optimisticResult, setOptimisticResult] = useState<Pick<
    RateResult,
    "floorRate" | "midRate" | "premiumRate"
  > | null>(null);

  const { trigger, isMutating, data, error } = useSWRMutation(
    "/api/rate/calculate",
    async (url, { arg }: { arg: RateInputs }) => {
      // Optimistic preview — runs synchronously before API responds
      if (benchmarks) {
        setOptimisticResult(calculateRateClient(arg, benchmarks));
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) throw new Error("Failed to calculate rate");
      return res.json() as Promise<{
        data: RateResult & { insights: string[]; tier: string };
      }>;
    },
  );

  // Use confirmed API result if available, fall back to optimistic preview
  const result = data?.data ?? optimisticResult;

  return {
    calculate: trigger,
    isMutating,
    result,
    insights: data?.data?.insights ?? [],
    tier: data?.data?.tier ?? null,
    isError: !!error,
  };
}
