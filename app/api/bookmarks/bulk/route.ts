import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { bulkUpdateBookmarks } from "@/lib/db/mutations";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json(
      { error: "Unauthorized curator session. Please refresh and log in." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];

    if (updates.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const updatedCount = await bulkUpdateBookmarks(updates);

    return NextResponse.json({
      success: true,
      count: updatedCount,
    });
  } catch (err: any) {
    console.error("Bulk bookmark update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update bookmarks in bulk." },
      { status: 500 }
    );
  }
}
