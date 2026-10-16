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
    expect(branch1?.branches).toBeDefined();
    expect(branch1?.branches?.length).toBe(1);
    expect(branch1?.branches?.[0].id).toBe(branchId2);

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

  it("should auto-create branch bookstore records when saving a flagship with multiple locations", async () => {
    const autoFlagshipId = `powells-flagship-${timestamp}`;
    const autoBranchId = `powells-books-beaverton-branch-beaverton`;

    try {
      await saveBookstoreDossier({
        bookstore: {
          id: autoFlagshipId,
          name: "Powell's Books",
          city: "Portland",
          stateProvince: "OR",
          country: "United States",
          streetAddress: "1005 W Burnside St",
          isFlagship: true,
          yearOpened: 1971,
          isStillOperating: true,
          historicalBlurb: "Famous Portland bookstore.",
          locations: [
            {
              id: "loc-1",
              label: "Burnside Flagship",
              streetAddress: "1005 W Burnside St",
              city: "Portland",
              stateProvince: "OR",
              country: "United States",
              isCurrent: true,
            },
            {
              id: autoBranchId,
              label: "Beaverton Branch",
              streetAddress: "3415 SW Cedar Hills Blvd",
              city: "Beaverton",
              stateProvince: "OR",
              country: "United States",
              isCurrent: true,
            },
          ],
        },
      });

      // Verify the auto-created branch was saved to bookstores table
      const branchStore = await getBookstoreById(autoBranchId);
      expect(branchStore).toBeDefined();
      expect(branchStore?.name).toContain("Powell's Books");
      expect(branchStore?.city).toBe("Beaverton");
      expect(branchStore?.flagshipId).toBe(autoFlagshipId);
      expect(branchStore?.isFlagship).toBe(false);

      // Verify flagship resolves this branch in branches array
      const flagship = await getBookstoreById(autoFlagshipId);
      expect(flagship?.branches?.some((b) => b.id === autoBranchId)).toBe(true);
    } finally {
      await db.delete(bookstores).where(eq(bookstores.id, autoFlagshipId));
      await db.delete(bookstores).where(eq(bookstores.id, autoBranchId));
    }
  });

  it("should never create a separate branch store for 1st Location (Flagship) and filter it out of getAllBookstores", async () => {
    const singleStoreFlagshipId = `independent-flagship-${timestamp}`;
    const redundant1stLocationId = `independent-flagship-1st-location-${timestamp}`;

    try {
      await saveBookstoreDossier({
        bookstore: {
          id: singleStoreFlagshipId,
          name: "Independent Books",
          city: "Arroyo Grande",
          stateProvince: "CA",
          country: "United States",
          streetAddress: "100 Branch St",
          isFlagship: true,
          yearOpened: 1980,
          isStillOperating: true,
          historicalBlurb: "Historic independent bookstore.",
          locations: [
            {
              id: "loc-1",
              label: "1st Location (Flagship)",
              streetAddress: "100 Branch St",
              city: "Arroyo Grande",
              stateProvince: "CA",
              country: "United States",
              isCurrent: true,
            },
          ],
        },
      });

      // Confirm no separate branch was generated in bookstores table
      const allBranches = await db.select().from(bookstores).where(eq(bookstores.flagshipId, singleStoreFlagshipId));
      expect(allBranches.length).toBe(0);

      // Now insert a legacy redundant 1st-location branch directly to simulate existing duplicate in DB
      await db.insert(bookstores).values({
        id: redundant1stLocationId,
        name: "Independent Books (1st Location (Original))",
        city: "Arroyo Grande",
        stateProvince: "CA",
        country: "United States",
        streetAddress: "100 Branch St",
        isFlagship: false,
        flagshipId: singleStoreFlagshipId,
        branchLabel: "1st Location (Original)",
        yearOpened: 1980,
        isStillOperating: true,
        historicalBlurb: "Branch location of Independent Books.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // getAllBookstores should filter it out and only return the primary flagship store
      const allStores = await getAllBookstores();
      const foundRedundant = allStores.find((s) => s.id === redundant1stLocationId);
      const foundMain = allStores.find((s) => s.id === singleStoreFlagshipId);
      expect(foundRedundant).toBeUndefined();
      expect(foundMain).toBeDefined();

      // Saving the flagship again should auto-clean up the redundant branch from the DB
      await saveBookstoreDossier({
        bookstore: {
          id: singleStoreFlagshipId,
          name: "Independent Books",
          city: "Arroyo Grande",
          stateProvince: "CA",
          country: "United States",
          streetAddress: "100 Branch St",
          isFlagship: true,
          yearOpened: 1980,
          isStillOperating: true,
          historicalBlurb: "Historic independent bookstore.",
          locations: [
            {
              id: "loc-1",
              label: "1st Location (Flagship)",
              streetAddress: "100 Branch St",
              city: "Arroyo Grande",
              stateProvince: "CA",
              country: "United States",
              isCurrent: true,
            },
          ],
        },
      });

      const branchesAfterSave = await db.select().from(bookstores).where(eq(bookstores.flagshipId, singleStoreFlagshipId));
      expect(branchesAfterSave.length).toBe(0);
    } finally {
      await db.delete(bookstores).where(eq(bookstores.id, singleStoreFlagshipId));
      await db.delete(bookstores).where(eq(bookstores.id, redundant1stLocationId));
    }
  });

  it("preserves independently added branch stores when re-saving a flagship bookstore (Books West workflow)", async () => {
    const booksWestFlagshipId = `bookswest-flagship-${timestamp}`;
    const booksWestAtascaderoId = `bookswest-atascadero-${timestamp}`;
    const booksWestLompocId = `bookswest-lompoc-${timestamp}`;

    try {
      // 1. Enter the flagship bookstore first (e.g. Books West Arroyo Grande) with 1st location and relocation
      await saveBookstoreDossier({
        bookstore: {
          id: booksWestFlagshipId,
          name: "Books West",
          city: "Arroyo Grande",
          stateProvince: "CA",
          country: "United States",
          streetAddress: "105 E Branch St",
          isFlagship: true,
          flagshipId: null,
          yearOpened: 1974,
          yearClosed: 1988,
          isStillOperating: false,
          historicalBlurb: "Flagship location in Arroyo Grande.",
          locations: [
            {
              id: "loc-ag-1",
              label: "1st Location",
              streetAddress: "105 E Branch St",
              city: "Arroyo Grande",
              stateProvince: "CA",
              yearsActive: "1974–1980",
              isMovedFrom: true,
            },
            {
              id: "loc-ag-2",
              label: "2nd Location (Relocated)",
              streetAddress: "130 W Branch St",
              city: "Arroyo Grande",
              stateProvince: "CA",
              yearsActive: "1980–1988",
              isCurrent: false,
            },
          ],
        },
      });

      // 2. Add branch 1: Books West Atascadero as its own bookstore tied to flagship
      await saveBookstoreDossier({
        bookstore: {
          id: booksWestAtascaderoId,
          name: "Books West Atascadero",
          city: "Atascadero",
          stateProvince: "CA",
          country: "United States",
          streetAddress: "6500 Morro Rd",
          isFlagship: false,
          flagshipId: booksWestFlagshipId,
          branchLabel: "Atascadero Branch",
          yearOpened: 1980,
          yearClosed: 1985,
          isStillOperating: false,
          historicalBlurb: "Atascadero branch bookstore.",
        },
      });

      // 3. Add branch 2: Books West Lompoc as its own bookstore tied to flagship
      await saveBookstoreDossier({
        bookstore: {
          id: booksWestLompocId,
          name: "Books West Lompoc",
          city: "Lompoc",
          stateProvince: "CA",
          country: "United States",
          streetAddress: "120 H St",
          isFlagship: false,
          flagshipId: booksWestFlagshipId,
          branchLabel: "Lompoc Branch",
          yearOpened: 1982,
          yearClosed: 1986,
          isStillOperating: false,
          historicalBlurb: "Lompoc branch bookstore.",
        },
      });

      // 4. Re-save the flagship bookstore (editing narrative, hours, or relocations)
      await saveBookstoreDossier({
        bookstore: {
          id: booksWestFlagshipId,
          name: "Books West",
          city: "Arroyo Grande",
          stateProvince: "CA",
          country: "United States",
          streetAddress: "105 E Branch St",
          isFlagship: true,
          flagshipId: null,
          yearOpened: 1974,
          yearClosed: 1988,
          isStillOperating: false,
          historicalBlurb: "Updated history of Books West Arroyo Grande.",
          locations: [
            {
              id: "loc-ag-1",
              label: "1st Location",
              streetAddress: "105 E Branch St",
              city: "Arroyo Grande",
              stateProvince: "CA",
              yearsActive: "1974–1980",
              isMovedFrom: true,
            },
            {
              id: "loc-ag-2",
              label: "2nd Location (Relocated)",
              streetAddress: "130 W Branch St",
              city: "Arroyo Grande",
              stateProvince: "CA",
              yearsActive: "1980–1988",
              isCurrent: false,
            },
          ],
        },
      });

      // 5. Verify the independently created branch bookstores were NOT deleted
      const atascadero = await getBookstoreById(booksWestAtascaderoId);
      const lompoc = await getBookstoreById(booksWestLompocId);
      expect(atascadero).toBeDefined();
      expect(lompoc).toBeDefined();
      expect(atascadero?.flagshipId).toBe(booksWestFlagshipId);
      expect(lompoc?.flagshipId).toBe(booksWestFlagshipId);

      // 6. Verify flagship query returns both branches
      const flagship = await getBookstoreById(booksWestFlagshipId);
      expect(flagship).toBeDefined();
      expect(flagship?.branches?.length).toBe(2);
      const branchIds = flagship?.branches?.map((b) => b.id);
      expect(branchIds).toContain(booksWestAtascaderoId);
      expect(branchIds).toContain(booksWestLompocId);
    } finally {
      await db.delete(bookstores).where(eq(bookstores.id, booksWestFlagshipId));
      await db.delete(bookstores).where(eq(bookstores.id, booksWestAtascaderoId));
      await db.delete(bookstores).where(eq(bookstores.id, booksWestLompocId));
    }
  });
});


