import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withSessionRoute } from "@/lib/session";
import { badRequest, parseBody, serverError } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const POST = withSessionRoute(async (req) => {
  try {
    const { error, body } = await parseBody(req, registerSchema);
    if (error || !body) return badRequest(error ?? "Invalid body");

    const { name, email, password } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return badRequest("An account with this email already exists");

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? undefined,
    };
    await req.session.save();

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch {
    return serverError();
  }
});
