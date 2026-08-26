import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized curator session" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".jpg";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^\w-]/g, "");
    const fileName = `${baseName}-${Date.now()}${ext}`;

    // 1. If running on Vercel with Vercel Blob storage configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${fileName}`, file, {
        access: "public",
      });

      return NextResponse.json({
        url: blob.url,
        fileName,
      });
    }

    // 2. Local filesystem storage (for local dev and Docker container)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.resolve(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        url: `/uploads/${fileName}`,
        fileName,
      });
    } catch (fsErr: any) {
      // If filesystem is read-only (e.g. on Vercel without Vercel Blob connected)
      if (fsErr.code === "EROFS") {
        return NextResponse.json(
          {
            error:
              "Image upload requires Vercel Blob storage on Vercel. Please enable 'Blob Storage' in your Vercel project's Storage tab.",
          },
          { status: 500 }
        );
      }
      throw fsErr;
    }
  } catch (err: any) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
