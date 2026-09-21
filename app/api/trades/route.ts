import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllTradeProposals } from "@/lib/db/queries";
import { createTradeProposal } from "@/lib/db/mutations";

export const dynamic = "force-dynamic";

/**
 * GET /api/trades
 * Retrieve all trade proposals (Curator session required).
 */
export async function GET() {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const proposals = await getAllTradeProposals();
    return NextResponse.json(proposals);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/trades
 * Public endpoint for collectors to submit a trade proposal.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectorName, collectorEmail, offeredItems, requestedBookmarkIds, requestedBookmarksSnapshot } = body;

    if (!collectorName || typeof collectorName !== "string" || !collectorName.trim()) {
      return NextResponse.json({ error: "Collector name is required" }, { status: 400 });
    }

    if (!collectorEmail || typeof collectorEmail !== "string" || !collectorEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    if (!offeredItems || typeof offeredItems !== "string" || !offeredItems.trim()) {
      return NextResponse.json({ error: "Please describe the bookmarks or ephemera you are offering" }, { status: 400 });
    }

    if (!Array.isArray(requestedBookmarkIds) || requestedBookmarkIds.length === 0) {
      return NextResponse.json({ error: "Please select at least one bookmark to request" }, { status: 400 });
    }

    const id = await createTradeProposal({
      collectorName,
      collectorEmail,
      offeredItems,
      requestedBookmarkIds,
      requestedBookmarksSnapshot,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error("Trade proposal creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit trade proposal" }, { status: 500 });
  }
}
