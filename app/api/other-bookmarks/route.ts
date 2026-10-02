import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getAllNonBookstoreBookmarks,
  getTradeNonBookstoreBookmarks,
} from "@/lib/db/queries";
import {
  createNonBookstoreBookmark,
  bulkCreateNonBookstoreBookmarks,
} from "@/lib/db/mutations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tradeOnly = searchParams.get("tradeOnly") === "true";

    const data = tradeOnly
      ? await getTradeNonBookstoreBookmarks()
      : await getAllNonBookstoreBookmarks();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check if bulk insert
    if (Array.isArray(body)) {
      const result = await bulkCreateNonBookstoreBookmarks(body);
      return NextResponse.json({ success: true, ...result });
    }

    if (body.items && Array.isArray(body.items)) {
      const result = await bulkCreateNonBookstoreBookmarks(body.items);
      return NextResponse.json({ success: true, ...result });
    }

    // Single insert
    if (!body.title || !body.frontImageUrl) {
      return NextResponse.json(
        { error: "Title and Front Image URL are required" },
        { status: 400 }
      );
    }

    const id = await createNonBookstoreBookmark(body);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
