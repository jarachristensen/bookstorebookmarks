import { NextResponse } from "next/server";
import { getAllBookstores } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stores = await getAllBookstores();
    return NextResponse.json(stores);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
