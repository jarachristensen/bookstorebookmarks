import { describe, it, expect } from "vitest";
import { classifyBookmarkRegion, getGeographicDrawers, GEOGRAPHIC_DRAWER_DEFS } from "@/lib/utils/geographic-drawers";
import { BookmarkWithDetails } from "@/lib/db/queries";

describe("Geographic Drawer Classification", () => {
  const createMockBookmark = (
    id: string,
    city: string,
    stateProvince: string | null,
    country: string
  ): BookmarkWithDetails => ({
    id,
    bookstoreId: `store-${id}`,
    title: `Bookmark ${id}`,
    accessionNo: `BM-${id}`,
    frontImageUrl: `/img-${id}.svg`,
    backImageUrl: null,
    yearProduced: 1950,
    material: "Paper",
    dimensions: '2" × 7"',
    condition: "Good",
    acquisitionDate: null,
    acquisitionNotes: null,
    isFeatured: false,
    displayOrder: 1,
    accentColor: null,
    createdAt: "",
    updatedAt: "",
    bookstore: {
      id: `store-${id}`,
      name: `Bookstore ${id}`,
      city,
      stateProvince,
      country,
      streetAddress: "123 Main St",
      yearOpened: 1920,
      yearClosed: null,
      isStillOperating: true,
      founders: "Founder",
      specialties: "[]",
      historicalBlurb: "",
      notablePatronsTrivia: "[]",
      websiteUrl: null,
      createdAt: "",
      updatedAt: "",
      archivalMedia: [],
    },
  });

  const sampleBookmarks: BookmarkWithDetails[] = [
    createMockBookmark("ny", "New York", "NY", "United States"),
    createMockBookmark("sf", "San Francisco", "CA", "United States"),
    createMockBookmark("paris", "Paris", "Île-de-France", "France"),
    createMockBookmark("chicago", "Chicago", "IL", "United States"),
    createMockBookmark("austin", "Austin", "TX", "United States"),
    createMockBookmark("london", "London", "England", "United Kingdom"),
    createMockBookmark("tokyo", "Tokyo", "Kanto", "Japan"),
    createMockBookmark("broken-arrow", "Broken Arrow", "OK", "United States"),
  ];

  it("correctly classifies regions for bookmarks based on city, state, and country", () => {
    expect(classifyBookmarkRegion(sampleBookmarks[0])).toBe("drawer-east-coast");
    expect(classifyBookmarkRegion(sampleBookmarks[1])).toBe("drawer-west-coast");
    expect(classifyBookmarkRegion(sampleBookmarks[2])).toBe("drawer-europe");
    expect(classifyBookmarkRegion(sampleBookmarks[3])).toBe("drawer-midwest");
    expect(classifyBookmarkRegion(sampleBookmarks[4])).toBe("drawer-south");
    expect(classifyBookmarkRegion(sampleBookmarks[5])).toBe("drawer-europe");
    expect(classifyBookmarkRegion(sampleBookmarks[6])).toBe("drawer-international");
    expect(classifyBookmarkRegion(sampleBookmarks[7])).toBe("drawer-midwest");
  });

  it("generates populated drawers including the Master Drawer", () => {
    const drawers = getGeographicDrawers(sampleBookmarks);
    expect(drawers.length).toBe(GEOGRAPHIC_DRAWER_DEFS.length);

    const masterDrawer = drawers.find((d) => d.id === "drawer-all");
    expect(masterDrawer).toBeDefined();
    expect(masterDrawer?.count).toBe(sampleBookmarks.length);
    expect(masterDrawer?.bookmarks.length).toBe(sampleBookmarks.length);

    const eastDrawer = drawers.find((d) => d.id === "drawer-east-coast");
    expect(eastDrawer?.count).toBe(1);

    const westDrawer = drawers.find((d) => d.id === "drawer-west-coast");
    expect(westDrawer?.count).toBe(1);

    const europeDrawer = drawers.find((d) => d.id === "drawer-europe");
    expect(europeDrawer?.count).toBe(2); // Paris & London

    const midwestDrawer = drawers.find((d) => d.id === "drawer-midwest");
    expect(midwestDrawer?.count).toBe(2); // Chicago & Broken Arrow (OK)

    const southDrawer = drawers.find((d) => d.id === "drawer-south");
    expect(southDrawer?.count).toBe(1); // Austin

    const intlDrawer = drawers.find((d) => d.id === "drawer-international");
    expect(intlDrawer?.count).toBe(1); // Tokyo
  });

  it("handles empty bookmarks array gracefully", () => {
    const drawers = getGeographicDrawers([]);
    expect(drawers.length).toBe(GEOGRAPHIC_DRAWER_DEFS.length);
    drawers.forEach((drawer) => {
      expect(drawer.count).toBe(0);
      expect(drawer.bookmarks).toEqual([]);
    });
  });
});
