import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBookmarksWithBookstores } from "@/lib/db/queries";
import { saveBookmarkAndBookstore } from "@/lib/db/mutations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const city = searchParams.get("city") || undefined;
    const era = searchParams.get("era") || undefined;
    const status = searchParams.get("status") as any;

    const data = await getBookmarksWithBookstores({ search, city, era, status });
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
    const slug = await saveBookmarkAndBookstore(body);
    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
