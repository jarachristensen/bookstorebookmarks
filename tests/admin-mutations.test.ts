import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import {
  saveBookmarkAndBookstore,
  deleteBookmark,
  toggleBookmarkFeatured,
} from "@/lib/db/mutations";
import { getBookmarkBySlug } from "@/lib/db/queries";

describe("Admin Mutations", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should create a new bookmark and bookstore record with media", async () => {
    const uniqueSlug = `strand-bookstore-rare-${Date.now()}`;
    const bookstoreSlug = `strand-bookstore-${Date.now()}`;

    const resultSlug = await saveBookmarkAndBookstore({
      bookmark: {
        id: uniqueSlug,
        title: "The Strand '18 Miles of Books' Vintage Bookmark",
        accessionNo: `BM-STRAND-${Date.now()}`,
        frontImageUrl: "/seed-images/gotham-front.svg",
        backImageUrl: "/seed-images/gotham-back.svg",
        yearProduced: 1968,
        material: "Gloss Cardstock",
        dimensions: "2.0\" × 7.5\"",
        condition: "Fine",
        acquisitionDate: "2015-08-10",
        acquisitionNotes: "Acquired at 828 Broadway",
        isFeatured: false,
        displayOrder: 10,
        accentColor: "#881337",
      },
      bookstore: {
        id: bookstoreSlug,
        name: "Strand Book Store",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        streetAddress: "828 Broadway",
        yearOpened: 1927,
        yearClosed: null,
        isStillOperating: true,
        founders: "Benjamin Bass",
        specialties: ["Used Books", "Rare Manuscripts", "Book Row Heritage"],
        historicalBlurb: "The sole survivor of New York's historic Book Row.",
        notablePatronsTrivia: ["Benjamin Bass opened the shop on Fourth Avenue."],
        websiteUrl: "https://www.strandbooks.com",
      },
      archivalMedia: [
        {
          id: `media-strand-${Date.now()}`,
          mediaType: "newspaper",
          imageUrl: "/seed-images/gotham-front.svg",
          caption: "New York Herald: Strand Expands to Broadway",
          sourcePublication: "New York Herald",
          publicationDate: "1957",
          transcriptionText: "Benjamin Bass opened the shop in 1927.",
          displayOrder: 1,
        },
      ],
    });

    expect(resultSlug).toBe(uniqueSlug);

    const saved = await getBookmarkBySlug(uniqueSlug);
    expect(saved).toBeDefined();
    expect(saved?.bookstore?.name).toBe("Strand Book Store");
    expect(saved?.bookstore?.archivalMedia.length).toBe(1);

    // Test toggle featured
    await toggleBookmarkFeatured(uniqueSlug, true);
    const updated = await getBookmarkBySlug(uniqueSlug);
    expect(updated?.isFeatured).toBe(true);

    // Test delete
    const deleted = await deleteBookmark(uniqueSlug);
    expect(deleted).toBe(true);

    const afterDelete = await getBookmarkBySlug(uniqueSlug);
    expect(afterDelete).toBeNull();
  });
});
