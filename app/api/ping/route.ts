import { NextResponse } from "next/server";

export async function HEAD() {
  // Try to verify actual internet connectivity by checking if we can resolve DNS
  // This helps detect when the PC is disconnected but localhost is still accessible
  try {
    // In a real production environment, you might want to ping an external service
    // For now, we'll just return OK since we can't easily test external connectivity
    // from the server in all environments (firewalls, etc.)
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
