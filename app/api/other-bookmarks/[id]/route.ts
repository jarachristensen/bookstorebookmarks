import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getNonBookstoreBookmarkById,
} from "@/lib/db/queries";
import {
  updateNonBookstoreBookmark,
  deleteNonBookstoreBookmark,
} from "@/lib/db/mutations";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getNonBookstoreBookmarkById(params.id);
    if (!item) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const success = await updateNonBookstoreBookmark(params.id, body);
    if (!success) {
      return NextResponse.json({ error: "Bookmark not found or update failed" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const success = await deleteNonBookstoreBookmark(params.id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
