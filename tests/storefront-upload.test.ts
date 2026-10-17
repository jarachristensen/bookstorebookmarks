import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/storefronts/upload/route";
import * as authModule from "@/lib/auth";
import { initDb, db } from "@/db";
import { bookstores, archivalMedia } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

describe("Storefront Uploader API Route", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await initDb();
  });

  it("rejects unauthenticated requests with 401", async () => {
    vi.spyOn(authModule, "getAdminSession").mockResolvedValue(false);

    const formData = new FormData();
    formData.append("file", new File(["fake image content"], "storefront.png", { type: "image/png" }));

    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects requests missing file with 400", async () => {
    vi.spyOn(authModule, "getAdminSession").mockResolvedValue(true);

    const formData = new FormData();
    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("uploads storefront and links to existing bookstore", async () => {
    vi.spyOn(authModule, "getAdminSession").mockResolvedValue(true);

    const testStoreId = `test-upload-store-${Date.now()}`;
    await db.insert(bookstores).values({
      id: testStoreId,
      name: "Test Upload Bookstore",
      city: "San Francisco",
      country: "United States",
      yearOpened: 1980,
      historicalBlurb: "Test store history",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      const file = new File(["fake image content"], "test-storefront.png", { type: "image/png" });
      file.arrayBuffer = async () => new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookstoreId", testStoreId);

      const req = {
        formData: async () => formData,
      } as unknown as NextRequest;

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.bookstoreId).toBe(testStoreId);
      expect(data.imageUrl).toBeDefined();

      // Check archivalMedia has storefront record
      const media = await db
        .select()
        .from(archivalMedia)
        .where(eq(archivalMedia.bookstoreId, testStoreId));
      const sfMedia = media.find((m) => m.isStorefront);
      expect(sfMedia).toBeDefined();
      expect(sfMedia?.mediaTag).toBe("storefront");
    } finally {
      await db.delete(bookstores).where(eq(bookstores.id, testStoreId));
      const testFilePath = path.resolve(process.cwd(), "public/images/storefronts/test-storefront.png");
      if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    }
  });

  it("uploads storefront and creates new bookstore when no bookstoreId provided", async () => {
    vi.spyOn(authModule, "getAdminSession").mockResolvedValue(true);

    const uniqueSlug = `new-store-${Date.now()}`;
    const filename = `${uniqueSlug}-storefront.png`;

    try {
      const file = new File(["fake image content"], filename, { type: "image/png" });
      file.arrayBuffer = async () => new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer;
      const formData = new FormData();
      formData.append("file", file);

      const req = {
        formData: async () => formData,
      } as unknown as NextRequest;

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.isNew).toBe(true);
      expect(data.bookstoreId).toBe(uniqueSlug);

      // Verify bookstore was created in DB
      const store = await db
        .select()
        .from(bookstores)
        .where(eq(bookstores.id, uniqueSlug));
      expect(store.length).toBe(1);
    } finally {
      await db.delete(bookstores).where(eq(bookstores.id, uniqueSlug));
      const testFilePath = path.resolve(process.cwd(), `public/images/storefronts/${filename}`);
      if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    }
  });
});
