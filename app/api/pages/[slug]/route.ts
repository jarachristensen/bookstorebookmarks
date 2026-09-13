import { NextRequest, NextResponse } from "next/server";
import { getPageContent, updatePageContent } from "@/lib/db/page-content";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json(
        { error: "Page slug is required" },
        { status: 400 }
      );
    }

    const content = await getPageContent(slug);
    return NextResponse.json({
      success: true,
      pageSlug: slug,
      content,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json(
        { error: "Page slug is required" },
        { status: 400 }
      );
    }

    // Check curator authorization session
    const isAuthed = await getAdminSession();
    if (!isAuthed) {
      // Optional: Check if a passphrase was passed in header
      const authHeader = request.headers.get("x-curator-passphrase");
      const validPassphrase = process.env.ADMIN_PASSPHRASE || "curator123";
      if (authHeader !== validPassphrase) {
        return NextResponse.json(
          { error: "Unauthorized curator session" },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const sections = body.sections || {};

    await updatePageContent(slug, sections);
    const updatedContent = await getPageContent(slug);

    return NextResponse.json({
      success: true,
      pageSlug: slug,
      content: updatedContent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
