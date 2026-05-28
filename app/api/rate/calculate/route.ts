import { NextResponse } from "next/server";
import { z } from "zod";
import { withSessionRoute } from "@/lib/session";
import { parseBody, serverError, badRequest } from "@/lib/api";
import { getBenchmarks } from "@/lib/benchmarks";
import {
  calculateRate,
  getRateInsights,
  getCreatorTier,
} from "@/lib/rate-engine";

const calculateSchema = z.object({
  platform: z.enum(["ig_reel", "ig_post", "ig_story", "yt_long", "yt_short"]),
  niche: z.enum([
    "finance",
    "tech",
    "lifestyle",
    "food",
    "fashion",
    "fitness",
    "gaming",
    "travel",
    "education",
    "beauty",
  ]),
  followers: z.number().int().min(1000).max(50_000_000),
  engagementRate: z.number().min(0.1).max(50),
  city: z.enum(["metro", "tier2", "tier3"]),
  deliverable: z.enum(["single", "bundle", "campaign"]),
});

export const POST = withSessionRoute(async (req) => {
  try {
    const { error, body } = await parseBody(req, calculateSchema);
    if (error || !body) return badRequest(error ?? "Invalid body");

    const benchmarks = await getBenchmarks();
    const result = calculateRate(body, benchmarks);
    const insights = getRateInsights(body, benchmarks);
    const tier = getCreatorTier(body.followers);

    return NextResponse.json({
      data: {
        ...result,
        insights,
        tier,
      },
    });
  } catch {
    return serverError();
  }
});
