import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookstores, bookmarks, archivalMedia } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allStores = await db.select().from(bookstores);
    const allBookmarks = await db.select().from(bookmarks);
    const allMedia = await db.select().from(archivalMedia);

    const exportData = {
      archiveName: "Bookstore Bookmark Collection & Historical Research",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      counts: {
        bookstores: allStores.length,
        bookmarks: allBookmarks.length,
        archivalMedia: allMedia.length,
      },
      bookstores: allStores,
      bookmarks: allBookmarks,
      archivalMedia: allMedia,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bookstore-archive-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
