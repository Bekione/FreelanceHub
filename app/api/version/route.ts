import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Read package.json once at module load time (this runs at build/cold start)
const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8"),
);

export async function GET() {
  return NextResponse.json(
    {
      version: pkg.version as string,
      name: pkg.name as string,
      env: process.env.NODE_ENV ?? "development",
    },
    {
      headers: {
        // Cache for 1 hour — version only changes on deploy
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
