import redis from "./redis";
import { prisma } from "./prisma";
import { BenchmarkData } from "@/types";

const BENCHMARK_VERSION = "v1";
const CACHE_KEY = `benchmarks:${BENCHMARK_VERSION}`;
const CACHE_TTL = 60 * 60 * 24; // 24 hours

// Module-scope memory cache — eliminates redundant Redis hits
// within the same warm serverless function invocation
let memoryCache: BenchmarkData | null = null;

/**
 * Returns the default India market benchmark multipliers.
 * Used as seed data on first deploy if no benchmark record exists in DB.
 * Update baseCpm and multipliers here when market rates change, then bump BENCHMARK_VERSION.
 */
function getDefaultBenchmarks(): BenchmarkData {
  return {
    version: BENCHMARK_VERSION,
    baseCpm: 0.06,

    nicheMults: {
      finance: 2.8,
      tech: 2.5,
      lifestyle: 1.2,
      food: 1.5,
      fashion: 1.4,
      fitness: 1.3,
      gaming: 1.1,
      travel: 1.35,
      education: 1.6,
      beauty: 1.45,
    },

    platformMults: {
      ig_reel: 1.0,
      ig_post: 0.7,
      ig_story: 0.4,
      yt_long: 2.2,
      yt_short: 0.65,
    },

    cityMults: {
      metro: 1.3,
      tier2: 1.0,
      tier3: 0.8,
    },

    deliverableMults: {
      single: 1.0,
      bundle: 2.6,
      campaign: 4.5,
    },
  };
}

/**
 * Fetches benchmark config through a three-layer cache:
 * memory → Redis → MongoDB.
 * Seeds default benchmarks into DB on first deploy if none exist.
 * Memory layer prevents redundant fetches within the same invocation.
 * Redis layer (24hr TTL) prevents redundant DB hits across invocations.
 */
export async function getBenchmarks(): Promise<BenchmarkData> {
  if (memoryCache) return memoryCache;

  const cached = await redis.get<string>(CACHE_KEY);
  if (cached) {
    memoryCache = JSON.parse(cached);
    return memoryCache!;
  }

  const record = await prisma.benchmark.findUnique({
    where: { version: BENCHMARK_VERSION },
  });

  if (!record) {
    const defaults = getDefaultBenchmarks();
    await prisma.benchmark.create({
      data: {
        version: BENCHMARK_VERSION,
        data: defaults as object,
      },
    });
    memoryCache = defaults;
    await redis.set(CACHE_KEY, JSON.stringify(defaults), { ex: CACHE_TTL });
    return defaults;
  }

  const data = record.data as unknown as BenchmarkData;
  memoryCache = data;
  await redis.set(CACHE_KEY, JSON.stringify(data), { ex: CACHE_TTL });
  return data;
}

/**
 * Invalidates both the in-memory and Redis benchmark caches.
 * Call this whenever benchmark data is updated in the DB.
 */
export async function invalidateBenchmarkCache(): Promise<void> {
  memoryCache = null;
  await redis.del(CACHE_KEY);
}
