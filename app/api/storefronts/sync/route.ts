import { NextResponse } from "next/server";
import { autoSyncStorefronts } from "@/lib/utils/storefront-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await autoSyncStorefronts({ force: true });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Storefronts sync failed:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await autoSyncStorefronts({ force: true });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Storefronts sync failed:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
