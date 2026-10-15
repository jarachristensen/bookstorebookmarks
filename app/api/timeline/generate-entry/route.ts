import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  generateTimelineEntryFromArticle,
  GenerateTimelineInput,
} from "@/lib/ai/timeline-generator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json(
      { error: "Unauthorized curator session. Please refresh and ensure you are logged in." },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as GenerateTimelineInput;
    const entry = await generateTimelineEntryFromArticle(body || {});

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Error generating timeline entry:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate timeline entry" },
      { status: 500 }
    );
  }
}
