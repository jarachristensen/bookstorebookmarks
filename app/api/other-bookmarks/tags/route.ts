import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllNonBookstoreTags } from "@/lib/db/queries";
import { createNonBookstoreTag, deleteNonBookstoreTag } from "@/lib/db/mutations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tags = await getAllNonBookstoreTags();
    return NextResponse.json({ tags });
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
    const { name, color } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const id = await createNonBookstoreTag(name, color);
    const updatedTags = await getAllNonBookstoreTags();
    return NextResponse.json({ success: true, id, tags: updatedTags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Tag name parameter is required" }, { status: 400 });
    }

    await deleteNonBookstoreTag(name);
    const updatedTags = await getAllNonBookstoreTags();
    return NextResponse.json({ success: true, tags: updatedTags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
