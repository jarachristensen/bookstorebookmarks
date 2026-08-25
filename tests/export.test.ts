import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import { GET } from "@/app/api/export/route";

describe("JSON Archive Export API", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should return complete database backup payload with metadata", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.exportedAt).toBeDefined();
    expect(json.version).toBe("1.0.0");
    expect(Array.isArray(json.bookstores)).toBe(true);
    expect(Array.isArray(json.bookmarks)).toBe(true);
    expect(Array.isArray(json.archivalMedia)).toBe(true);
    expect(json.bookmarks.length).toBeGreaterThanOrEqual(4);
  });
});
