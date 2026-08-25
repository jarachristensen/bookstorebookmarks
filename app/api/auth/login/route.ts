import { NextRequest, NextResponse } from "next/server";
import { verifyPassphrase, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { passphrase } = await req.json();

    if (!verifyPassphrase(passphrase)) {
      return NextResponse.json(
        { error: "Invalid curator passphrase" },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set("curator_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Authentication error" },
      { status: 500 }
    );
  }
}
