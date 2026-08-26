import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized curator session" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";

  // 1. Direct Client-to-Blob Upload token generation (Bypasses Vercel 4.5MB limit, supports up to 50MB scans)
  if (contentType.includes("application/json") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const body = (await req.json()) as HandleUploadBody;
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname) => {
          return {
            allowedContentTypes: [
              "image/jpeg",
              "image/png",
              "image/webp",
              "image/svg+xml",
              "image/gif",
              "image/tiff",
            ],
            maximumSizeInBytes: 50 * 1024 * 1024, // 50MB high-res scans
          };
        },
        onUploadCompleted: async () => {},
      });

      return NextResponse.json(jsonResponse);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  // 2. Standard Multipart / Local Development Fallback
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
  } catch (err: any) {
    if (err.code === "EROFS") {
      return NextResponse.json(
        {
          error:
            "Vercel Blob storage required on Vercel. Please ensure 'Blob Storage' is connected to your project.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
