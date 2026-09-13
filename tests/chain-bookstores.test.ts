import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db, initDb } from "@/db";
import { bookstores } from "@/db/schema";
import { saveBookstoreDossier } from "@/lib/db/mutations";
import { getBookstoreById, getAllBookstores } from "@/lib/db/queries";
import { eq } from "drizzle-orm";

describe("Chain Bookstores & Flagship / Branch Relationships", () => {
  const timestamp = Date.now();
  const flagshipId = `borders-flagship-${timestamp}`;
  const branchId1 = `borders-ann-arbor-${timestamp}`;
  const branchId2 = `borders-chestnut-hill-${timestamp}`;

  beforeAll(async () => {
    await initDb();
  });

  afterAll(async () => {
    await db.delete(bookstores).where(eq(bookstores.id, flagshipId));
    await db.delete(bookstores).where(eq(bookstores.id, branchId1));
    await db.delete(bookstores).where(eq(bookstores.id, branchId2));
  });

  it("should create a flagship store and branch stores, and resolve relationships in queries", async () => {
    // 1. Create Flagship Store
    await saveBookstoreDossier({
      bookstore: {
        id: flagshipId,
        name: "Borders Book Shop (Flagship)",
        city: "Ann Arbor",
        stateProvince: "MI",
        country: "United States",
        streetAddress: "303 S. State St.",
        isFlagship: true,
        flagshipId: null,
        chainName: "Borders Book Shop",
        branchLabel: "Original Flagship",
        yearOpened: 1971,
        yearClosed: 2011,
        isStillOperating: false,
        historicalBlurb: "The founding flagship location of Borders Book Shop in Ann Arbor, Michigan.",
      },
    });

    // 2. Create Branch Store 1
    await saveBookstoreDossier({
      bookstore: {
        id: branchId1,
        name: "Borders Book Shop (State St. Branch)",
        city: "Ann Arbor",
        stateProvince: "MI",
        country: "United States",
        streetAddress: "612 E. Liberty St.",
        isFlagship: false,
        flagshipId: flagshipId,
        chainName: "Borders Book Shop",
        branchLabel: "Liberty St. Branch",
        yearOpened: 1980,
        yearClosed: 2011,
        isStillOperating: false,
        historicalBlurb: "Secondary Ann Arbor location.",
      },
    });

    // 3. Create Branch Store 2
    await saveBookstoreDossier({
      bookstore: {
        id: branchId2,
        name: "Borders Book Shop (Chestnut Hill)",
        city: "Chestnut Hill",
        stateProvince: "MA",
        country: "United States",
        streetAddress: "Boylston St.",
        isFlagship: false,
        flagshipId: flagshipId,
        chainName: "Borders Book Shop",
        branchLabel: "Chestnut Hill Branch",
        yearOpened: 1992,
        yearClosed: 2011,
        isStillOperating: false,
        historicalBlurb: "Massachusetts branch location.",
      },
    });

    // 4. Test Query on Branch 1 -> should have flagshipStore resolved
    const branch1 = await getBookstoreById(branchId1);
    expect(branch1).toBeDefined();
    expect(branch1?.name).toBe("Borders Book Shop (State St. Branch)");
    expect(branch1?.isFlagship).toBe(false);
    expect(branch1?.flagshipId).toBe(flagshipId);
    expect(branch1?.chainName).toBe("Borders Book Shop");
    expect(branch1?.branchLabel).toBe("Liberty St. Branch");
    expect(branch1?.flagshipStore).toBeDefined();
    expect(branch1?.flagshipStore?.id).toBe(flagshipId);
    expect(branch1?.flagshipStore?.name).toBe("Borders Book Shop (Flagship)");

    // 5. Test Query on Flagship -> should have branches array resolved
    const flagship = await getBookstoreById(flagshipId);
    expect(flagship).toBeDefined();
    expect(flagship?.isFlagship).toBe(true);
    expect(flagship?.chainName).toBe("Borders Book Shop");
    expect(flagship?.branchLabel).toBe("Original Flagship");
    expect(flagship?.branches).toBeDefined();
    expect(flagship?.branches?.length).toBe(2);
    const branchIds = flagship?.branches?.map((b) => b.id);
    expect(branchIds).toContain(branchId1);
    expect(branchIds).toContain(branchId2);

    // 6. Test getAllBookstores returns chain properties
    const allStores = await getAllBookstores();
    const foundFlagship = allStores.find((s) => s.id === flagshipId);
    const foundBranch2 = allStores.find((s) => s.id === branchId2);
    expect(foundFlagship?.isFlagship).toBe(true);
    expect(foundBranch2?.flagshipId).toBe(flagshipId);
    expect(foundBranch2?.flagshipStore?.id).toBe(flagshipId);
  });
});
