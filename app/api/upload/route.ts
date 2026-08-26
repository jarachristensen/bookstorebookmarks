import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Auto-detects Vercel Blob token regardless of custom store name
 * (e.g. BLOB_READ_WRITE_TOKEN, BOOKMARK_SCANS_READ_WRITE_TOKEN, etc.)
 */
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const blobToken = getBlobToken();

    // 1. If running on Vercel with Vercel Blob connected
    if (blobToken) {
      let blob;
      try {
        blob = await put(`uploads/${fileName}`, buffer, {
          access: "public",
          token: blobToken,
        });
      } catch (blobErr: any) {
        // If store is configured as private, retry without access: "public"
        if (
          blobErr.message?.includes("private store") ||
          blobErr.message?.includes("public access")
        ) {
          blob = await put(`uploads/${fileName}`, buffer, {
            token: blobToken,
          } as any);
        } else {
          throw blobErr;
        }
      }

      return NextResponse.json({
        url: blob.url,
        fileName,
      });
    }

    // 2. Local filesystem storage (for local dev and Docker container)
    try {
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
      if (fsErr.code === "EROFS") {
        return NextResponse.json(
          {
            error:
              "Vercel Blob storage token not detected. Please ensure 'Blob Storage' is connected in your Vercel project Settings.",
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
