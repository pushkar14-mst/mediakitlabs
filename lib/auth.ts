import { IronSession } from "iron-session";
import { NextResponse } from "next/server";
import { SessionData } from "./session";
import { prisma } from "./prisma";
import redis from "./redis";

export async function buildLogout(
  req: Request & { session: IronSession<SessionData> },
) {
  await req.session.destroy();
  await req.session.save();

  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL),
    { status: 302 },
  );
}

export async function getCachedUser(userId: string) {
  try {
    const key = `user:${userId}`;
    const cached = await redis.get<string>(key);
    if (cached) return JSON.parse(cached);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    await redis.set(key, JSON.stringify(user), { ex: 300 });
    return user;
  } catch {
    return null;
  }
}

export function invalidateUserCache(userId: string) {
  return redis.del(`user:${userId}`);
}
