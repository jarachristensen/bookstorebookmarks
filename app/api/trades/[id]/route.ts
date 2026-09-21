import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getTradeProposalById } from "@/lib/db/queries";
import { updateTradeProposalStatus, deleteTradeProposal } from "@/lib/db/mutations";

export const dynamic = "force-dynamic";

/**
 * GET /api/trades/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const proposal = await getTradeProposalById(params.id);
    if (!proposal) {
      return NextResponse.json({ error: "Trade proposal not found" }, { status: 404 });
    }
    return NextResponse.json(proposal);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/trades/[id]
 * Update proposal status (e.g. 'accepted', 'declined') and automatically
 * deduct inventory if accepted.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, notes } = body;

    const validStatuses = ["pending", "accepted", "declined", "completed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const success = await updateTradeProposalStatus(params.id, status, notes);
    if (!success) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update trade proposal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/trades/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const success = await deleteTradeProposal(params.id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
