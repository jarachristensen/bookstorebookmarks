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

  it("correctly classifies regions for bookmarks by US State and Other Countries", () => {
    expect(classifyBookmarkRegion(sampleBookmarks[0])).toBe("drawer-state-ny");
    expect(classifyBookmarkRegion(sampleBookmarks[1])).toBe("drawer-state-ca");
    expect(classifyBookmarkRegion(sampleBookmarks[2])).toBe("drawer-international");
    expect(classifyBookmarkRegion(sampleBookmarks[3])).toBe("drawer-state-il");
    expect(classifyBookmarkRegion(sampleBookmarks[4])).toBe("drawer-state-tx");
    expect(classifyBookmarkRegion(sampleBookmarks[5])).toBe("drawer-international");
    expect(classifyBookmarkRegion(sampleBookmarks[6])).toBe("drawer-international");
    expect(classifyBookmarkRegion(sampleBookmarks[7])).toBe("drawer-state-ok");
  });

  it("generates populated state drawers and other countries drawer (51 drawers total)", () => {
    const drawers = getGeographicDrawers(sampleBookmarks);
    expect(drawers.length).toBe(51);
    expect(drawers.length).toBe(GEOGRAPHIC_DRAWER_DEFS.length);

    const nyDrawer = drawers.find((d) => d.id === "drawer-state-ny");
    expect(nyDrawer?.count).toBe(1);

    const caDrawer = drawers.find((d) => d.id === "drawer-state-ca");
    expect(caDrawer?.count).toBe(1);

    const ilDrawer = drawers.find((d) => d.id === "drawer-state-il");
    expect(ilDrawer?.count).toBe(1);

    const okDrawer = drawers.find((d) => d.id === "drawer-state-ok");
    expect(okDrawer?.count).toBe(1);

    const intlDrawer = drawers.find((d) => d.id === "drawer-international");
    expect(intlDrawer?.count).toBe(3); // Paris, London, Tokyo
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
