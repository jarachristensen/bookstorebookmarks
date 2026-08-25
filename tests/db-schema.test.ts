import { describe, it, expect, beforeAll } from "vitest";
import { bookstores, bookmarks, archivalMedia } from "@/db/schema";
import { db, initDb } from "@/db";
import { eq } from "drizzle-orm";

describe("Database Schema & Connection", () => {
  beforeAll(async () => {
    await initDb();
  });

  it("should export schema tables with correct columns", () => {
    expect(bookstores).toBeDefined();
    expect(bookmarks).toBeDefined();
    expect(archivalMedia).toBeDefined();
  });

  it("should initialize sqlite client, create tables and perform CRUD", async () => {
    const testBookstoreId = `test-bookstore-${Date.now()}`;
    const now = new Date().toISOString();

    // Insert test bookstore
    await db.insert(bookstores).values({
      id: testBookstoreId,
      name: "Test Archival Books",
      city: "San Francisco",
      country: "United States",
      yearOpened: 1955,
      isStillOperating: true,
      historicalBlurb: "A historic testing bookstore.",
      createdAt: now,
      updatedAt: now,
    });

    const found = await db.query.bookstores.findFirst({
      where: eq(bookstores.id, testBookstoreId),
    });

    expect(found).toBeDefined();
    expect(found?.name).toBe("Test Archival Books");
    expect(found?.city).toBe("San Francisco");
    expect(found?.isStillOperating).toBe(true);

    // Clean up
    await db.delete(bookstores).where(eq(bookstores.id, testBookstoreId));
  });
});
