import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withSessionRoute } from "@/lib/session";
import { badRequest, parseBody, serverError, unauthorized } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const POST = withSessionRoute(async (req) => {
  try {
    const { error, body } = await parseBody(req, loginSchema);
    if (error || !body) return badRequest(error ?? "Invalid body");

    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Constant-time comparison even when user not found
    // prevents timing attacks that reveal whether an email is registered
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, "$2b$12$placeholderHashToPreventTiming");

    if (!user || !passwordMatch) {
      return unauthorized();
    }

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
