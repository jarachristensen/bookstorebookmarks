import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { db, initDb } from "@/db";
import { bookstores, archivalMedia } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  formatStoreNameFromFilename,
  slugifyStoreName,
  normalizeStoreName,
} from "@/lib/utils/storefront";

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

export async function POST(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json(
      { error: "Unauthorized curator session. Please log in." },
      { status: 401 }
    );
  }

  try {
    await initDb();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const requestedBookstoreId = (formData.get("bookstoreId") as string)?.trim() || "";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in upload request" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || ".png";
    const rawBaseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^\w-]/g, "");

    const fileName = `${rawBaseName || "storefront"}${ext}`;
    const bytes =
      typeof file.arrayBuffer === "function"
        ? await file.arrayBuffer()
        : Buffer.from((await (file as any).text?.()) || "");
    const buffer = Buffer.from(bytes);

    const blobToken = getBlobToken();
    let imageUrl: string;

    if (blobToken) {
      // 1. Production: Upload to Vercel Blob Storage
      let blob;
      try {
        blob = await put(`storefronts/${fileName}`, buffer, {
          access: "public",
          token: blobToken,
        });
      } catch (blobErr: any) {
        if (
          blobErr.message?.includes("private store") ||
          blobErr.message?.includes("public access")
        ) {
          blob = await put(`storefronts/${fileName}`, buffer, {
            token: blobToken,
          } as any);
        } else {
          throw new Error(`Blob storage upload failed: ${blobErr.message || blobErr}`);
        }
      }
      imageUrl = blob.url;
    } else {
      // 2. Local environment: Save directly to public/images/storefronts
      const storefrontsDir = path.resolve(process.cwd(), "public/images/storefronts");
      if (!fs.existsSync(storefrontsDir)) {
        fs.mkdirSync(storefrontsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(storefrontsDir, fileName), buffer);
      imageUrl = `/images/storefronts/${fileName}`;
    }

    const now = new Date().toISOString();
    let targetStoreId = requestedBookstoreId;
    let targetStoreName = "";
    let isNew = false;

    if (targetStoreId) {
      const existing = await db
        .select()
        .from(bookstores)
        .where(eq(bookstores.id, targetStoreId))
        .limit(1);

      if (existing.length > 0) {
        targetStoreName = existing[0].name;
      }
    }

    if (!targetStoreId) {
      // Derive bookstore name & slug from filename
      const extractedName = formatStoreNameFromFilename(fileName);
      const cleanStem = rawBaseName.replace(/[-_]?(storefront|front)$/i, "");
      const derivedSlug = cleanStem || slugifyStoreName(extractedName) || `store-${Date.now()}`;

      // Check if bookstore already exists
      const existing = await db
        .select()
        .from(bookstores)
        .where(eq(bookstores.id, derivedSlug))
        .limit(1);

      if (existing.length > 0) {
        targetStoreId = existing[0].id;
        targetStoreName = existing[0].name;
      } else {
        targetStoreId = derivedSlug;
        targetStoreName = extractedName;
        isNew = true;

        await db.insert(bookstores).values({
          id: targetStoreId,
          name: targetStoreName,
          city: "Unknown",
          stateProvince: null,
          country: "United States",
          yearOpened: 1970,
          isStillOperating: true,
          specialties: JSON.stringify(["Independent Bookseller", "Community Bookstore"]),
          historicalBlurb: `### ${targetStoreName}\n\nHistoric independent bookstore cataloged in the archive.`,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Attach storefront image in archivalMedia table
    const mediaId = `storefront-upload-${targetStoreId}-${Date.now()}`;
    await db.insert(archivalMedia).values({
      id: mediaId,
      bookstoreId: targetStoreId,
      mediaType: "photo",
      imageUrl: imageUrl,
      caption: `${targetStoreName || "Bookstore"} Storefront`,
      isStorefront: true,
      mediaTag: "storefront",
      displayOrder: 0,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      bookstoreId: targetStoreId,
      bookstoreName: targetStoreName,
      imageUrl,
      isNew,
    });
  } catch (err: any) {
    console.error("Storefront upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload storefront photo." },
      { status: 500 }
    );
  }
}
