import { NextResponse } from "next/server";
import { getBenchmarks } from "@/lib/benchmarks";
import { serverError } from "@/lib/api";

export const GET = async () => {
  try {
    const benchmarks = await getBenchmarks();

    return NextResponse.json(
      { data: benchmarks },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return serverError();
  }
};
