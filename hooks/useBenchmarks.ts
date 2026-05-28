import useSWR from "swr";
import { BenchmarkData } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Fetches and caches benchmark multiplier config from the API.
 * Revalidation is disabled — benchmark data changes rarely and is versioned.
 */
export function useBenchmarks() {
  const { data, error, isLoading } = useSWR<{ data: BenchmarkData }>(
    "/api/benchmarks",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60,
    },
  );

  return {
    benchmarks: data?.data ?? null,
    isLoading,
    isError: !!error,
  };
}
