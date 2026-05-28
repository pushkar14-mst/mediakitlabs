import { NextResponse } from "next/server";
import { withSessionRoute } from "@/lib/session";
import { getUserObject, serverError, unauthorized } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

export const GET = withSessionRoute(async (req) => {
  try {
    const user = await getUserObject(req);
    if (!user) return unauthorized();

    const cacheKey = `rate-cards:${user.id}`;

    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({ data: JSON.parse(cached) });
    }

    const rateCards = await prisma.rateCard.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    await redis.set(cacheKey, JSON.stringify(rateCards), {
      ex: 60 * 5,
    });

    return NextResponse.json({ data: rateCards });
  } catch {
    return serverError();
  }
});
