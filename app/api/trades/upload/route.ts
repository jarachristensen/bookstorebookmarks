import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (key.endsWith("_READ_WRITE_TOKEN") && value) {
      return value;
    }
  }
  return undefined;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/tiff",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err: any) {
    console.error("formData parsing error:", err);
    return NextResponse.json(
      { error: "Invalid multipart form data." },
      { status: 400 }
    );
  }


  try {
    const file = formData.get("file") as File;


    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds 15MB limit." },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type) && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP) are supported for trade proposals." },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || ".webp";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^\w-]/g, "");
    const fileName = `trade-${baseName || "photo"}-${Date.now()}${ext}`;

    const bytes = typeof file.arrayBuffer === "function"
      ? await file.arrayBuffer()
      : Buffer.from("");
    const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
    const blobToken = getBlobToken();

    // 1. If Vercel Blob connected
    if (blobToken) {
      let blob;
      try {
        blob = await put(`uploads/trades/${fileName}`, buffer, {
          access: "public",
          token: blobToken,
        });
      } catch (blobErr: any) {
        if (
          blobErr.message?.includes("private store") ||
          blobErr.message?.includes("public access")
        ) {
          blob = await put(`uploads/trades/${fileName}`, buffer, {
            token: blobToken,
          } as any);
        } else {
          throw new Error(`Blob storage upload failed: ${blobErr.message || blobErr}`);
        }
      }

      return NextResponse.json({
        url: blob.url,
        fileName,
      });
    }

    // 2. Local filesystem storage
    try {
      const uploadsDir = path.resolve(process.cwd(), "public/uploads/trades");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        url: `/uploads/trades/${fileName}`,
        fileName,
      });
    } catch (fsErr: any) {
      if (fsErr.code === "EROFS") {
        return NextResponse.json(
          {
            error:
              "Storage error: read-only filesystem and Blob storage token not detected.",
          },
          { status: 500 }
        );
      }
      throw new Error(`Local file system storage failed: ${fsErr.message || fsErr}`);
    }
  } catch (err: any) {
    console.error("Trade Image Upload Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload trade proposal image." },
      { status: 500 }
    );
  }
}
