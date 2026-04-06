import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { newPassword } = await req.json();

    const result = await auth.api.setPassword({
      body: {
        newPassword,
      },
      headers: await headers(),
    });

    return Response.json(result);
  } catch (error: any) {
    console.error("Set password error:", error);
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 },
    );
  }
}
