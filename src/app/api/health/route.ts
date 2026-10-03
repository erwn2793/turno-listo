import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    entorno: process.env.VERCEL_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
}
