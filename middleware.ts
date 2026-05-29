import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import { SessionData } from "@/lib/session";

const SESSION_COOKIE = "colabrate_session";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/api/benchmarks") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(.*)$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE);

  if (!cookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { user } = await unsealData<SessionData>(cookie.value, {
      password: process.env.SESSION_SECRET as string,
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
