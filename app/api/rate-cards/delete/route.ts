import { NextResponse } from "next/server";
import { z } from "zod";
import { withSessionRoute } from "@/lib/session";
import {
  getUserObject,
  parseBody,
  serverError,
  unauthorized,
  badRequest,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

const saveSchema = z.object({
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
  floorRate: z.number().int().positive(),
  midRate: z.number().int().positive(),
  premiumRate: z.number().int().positive(),
  label: z.string().max(80).optional(),
});

export const POST = withSessionRoute(async (req) => {
  try {
    const user = await getUserObject(req);
    if (!user) return unauthorized();

    const { error, body } = await parseBody(req, saveSchema);
    if (error || !body) return badRequest(error ?? "Invalid body");

    const rateCard = await prisma.rateCard.create({
      data: {
        userId: user.id,
        ...body,
      },
    });
    await redis.del(`rate-cards:${user.id}`);
    return NextResponse.json({ data: rateCard });
  } catch {
    return serverError();
  }
});
