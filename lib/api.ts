import { IronSession } from "iron-session";
import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { prisma } from "./prisma";
import { SessionData } from "./session";
import redis from "./redis";

type RequestWithSession = Request & { session: IronSession<SessionData> };

export async function getUserObject(req: RequestWithSession) {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return null;

    const key = `user:${userId}`;

    const cached = await redis.get<string>(key);
    if (cached) return JSON.parse(cached);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    await redis.set(key, JSON.stringify(user), { ex: 300 });

    return user;
  } catch {
    return null;
  }
}

export async function parseBody<T>(
  req: Request & { session: IronSession<SessionData> },
  schema: ZodSchema<T>,
): Promise<{ error: string | null; body: T | null }> {
  const body = await req.json();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error(parsed.error);
    if (parsed.error.issues[0].message)
      return { error: parsed.error.issues[0].message, body: null };
    return { error: parsed.error.message, body: null };
  }
  return { error: null, body: parsed.data };
}

export function isValidObjectId(id: string | null | undefined) {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
