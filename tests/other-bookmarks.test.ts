import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import {
  createNonBookstoreBookmark,
  bulkCreateNonBookstoreBookmarks,
  updateNonBookstoreBookmark,
  deleteNonBookstoreBookmark,
  createTradeProposal,
  updateTradeProposalStatus,
  createNonBookstoreTag,
  deleteNonBookstoreTag,
} from "@/lib/db/mutations";
import {
  getAllNonBookstoreBookmarks,
  getTradeNonBookstoreBookmarks,
  getNonBookstoreBookmarkById,
  getNonBookstoreCategories,
  getAllNonBookstoreTags,
  getTradeProposalById,
} from "@/lib/db/queries";

describe("Other Bookmarks (Non-Bookstore Ephemera) & Multi-Tag Studio", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should create and retrieve a single non-bookstore bookmark with multiple tags", async () => {
    const timestamp = Date.now();
    const id = `other-test-library-${timestamp}`;

    const createdId = await createNonBookstoreBookmark({
      id,
      title: "Seattle Public Library Vintage Card",
      tags: ["Libraries", "Pacific Northwest", "Vintage 1980s"],
      frontImageUrl: "/images/other/spl-front.jpg",
      backImageUrl: "/images/other/spl-back.jpg",
      tradeQuantity: 3,
      dimensions: '2" × 6.5"',
      material: "Heavy Stock",
      condition: "Near Mint",
      notes: "Acquired from a library book sale in 1994",
      displayOrder: 1,
    });

    expect(createdId).toBe(id);

    const retrieved = await getNonBookstoreBookmarkById(id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe("Seattle Public Library Vintage Card");
    expect(retrieved?.tradeQuantity).toBe(3);
    expect(retrieved?.backImageUrl).toBe("/images/other/spl-back.jpg");

    // Verify tags JSON array
    const parsedTags = JSON.parse(retrieved!.tags!);
    expect(parsedTags).toEqual(["Libraries", "Pacific Northwest", "Vintage 1980s"]);
    expect(retrieved?.category).toBe("Libraries"); // Primary category fallback
  });

  it("should create, aggregate, and delete custom tags", async () => {
    const timestamp = Date.now();
    const customTagName = `Author Signings ${timestamp}`;

    // Create custom tag
    const tagId = await createNonBookstoreTag(customTagName);
    expect(tagId).toBeDefined();

    // Verify tag is returned in getAllNonBookstoreTags
    let allTags = await getAllNonBookstoreTags();
    expect(allTags).toContain(customTagName);

    // Delete custom tag
    const deleted = await deleteNonBookstoreTag(customTagName);
    expect(deleted).toBe(true);

    allTags = await getAllNonBookstoreTags();
    expect(allTags).not.toContain(customTagName);
  });

  it("should bulk create non-bookstore bookmarks with tags and retrieve distinct categories", async () => {
    const timestamp = Date.now();
    const items = [
      {
        id: `other-bulk-1-${timestamp}`,
        title: "Penguin Classics Orange Spine",
        tags: ["Publishers", "Penguin Books", "Paperback Ephemera"],
        frontImageUrl: "/images/other/penguin-front.jpg",
        tradeQuantity: 2,
      },
      {
        id: `other-bulk-2-${timestamp}`,
        title: "Metropolitan Museum of Art 1988",
        tags: ["Museums & Galleries", "New York Art"],
        frontImageUrl: "/images/other/met-front.jpg",
        tradeQuantity: 1,
      },
      {
        id: `other-bulk-3-${timestamp}`,
        title: "Vintage Coffee Ad Bookmark",
        tags: ["Advertising", "Food & Drink"],
        frontImageUrl: "/images/other/coffee-front.jpg",
        tradeQuantity: 0, // Not available for trade
      },
    ];

    const result = await bulkCreateNonBookstoreBookmarks(items);
    expect(result.inserted).toBe(3);
    expect(result.ids.length).toBe(3);

    // Test queries
    const all = await getAllNonBookstoreBookmarks();
    expect(all.some((b) => b.id === `other-bulk-1-${timestamp}`)).toBe(true);
    expect(all.some((b) => b.id === `other-bulk-3-${timestamp}`)).toBe(true);

    const tradeOnly = await getTradeNonBookstoreBookmarks();
    expect(tradeOnly.some((b) => b.id === `other-bulk-1-${timestamp}`)).toBe(true);
    expect(tradeOnly.some((b) => b.id === `other-bulk-2-${timestamp}`)).toBe(true);
    // Quantity 0 should not be in tradeOnly
    expect(tradeOnly.some((b) => b.id === `other-bulk-3-${timestamp}`)).toBe(false);

    // Test tags aggregation
    const tags = await getAllNonBookstoreTags();
    expect(tags).toContain("Publishers");
    expect(tags).toContain("Penguin Books");
    expect(tags).toContain("Museums & Galleries");
    expect(tags).toContain("Advertising");
  });

  it("should update a non-bookstore bookmark tags and quantity", async () => {
    const timestamp = Date.now();
    const id = `other-update-test-${timestamp}`;

    await createNonBookstoreBookmark({
      id,
      title: "Original Title",
      tags: ["Publishers"],
      frontImageUrl: "/images/other/test.jpg",
      tradeQuantity: 1,
    });

    const success = await updateNonBookstoreBookmark(id, {
      title: "Updated Title After Verification",
      tags: ["Publishers", "Rare Edition", "Collector's Item"],
      tradeQuantity: 5,
      frontImageUrl: "/images/other/test-updated.jpg",
      backImageUrl: "/images/other/test-back.jpg",
      dimensions: '2.5" × 8"',
      material: "Laminated Stock",
      condition: "Mint",
      notes: "Curator notes updated with provenance details",
    });
    expect(success).toBe(true);

    const updated = await getNonBookstoreBookmarkById(id);
    expect(updated?.title).toBe("Updated Title After Verification");
    expect(updated?.tradeQuantity).toBe(5);
    expect(updated?.frontImageUrl).toBe("/images/other/test-updated.jpg");
    expect(updated?.backImageUrl).toBe("/images/other/test-back.jpg");
    expect(updated?.dimensions).toBe('2.5" × 8"');
    expect(updated?.material).toBe("Laminated Stock");
    expect(updated?.condition).toBe("Mint");
    expect(updated?.notes).toBe("Curator notes updated with provenance details");
    const parsedTags = JSON.parse(updated!.tags!);
    expect(parsedTags).toContain("Rare Edition");
  });

  it("should delete a non-bookstore bookmark", async () => {
    const timestamp = Date.now();
    const id = `other-delete-test-${timestamp}`;

    await createNonBookstoreBookmark({
      id,
      title: "To Be Deleted",
      frontImageUrl: "/images/other/delete.jpg",
      tradeQuantity: 1,
    });

    const deleted = await deleteNonBookstoreBookmark(id);
    expect(deleted).toBe(true);

    const check = await getNonBookstoreBookmarkById(id);
    expect(check).toBeNull();
  });

  it("should snapshot and automatically deduct inventory when trading a non-bookstore bookmark", async () => {
    const timestamp = Date.now();
    const id = `other-trade-deduct-${timestamp}`;

    await createNonBookstoreBookmark({
      id,
      title: "Rare New Yorker Literary Bookmark",
      tags: ["Literary Magazines", "New York City"],
      frontImageUrl: "/images/other/new-yorker.jpg",
      tradeQuantity: 2,
    });

    // Create a trade proposal requesting this item
    const proposalId = await createTradeProposal({
      collectorName: "Bob Ephemera",
      collectorEmail: "bob@example.com",
      offeredItems: "Vintage Paris Review Bookmark",
      requestedBookmarkIds: [id],
    });

    const proposal = await getTradeProposalById(proposalId);
    expect(proposal).toBeDefined();

    const snapshot = JSON.parse(proposal!.requestedBookmarksSnapshot);
    expect(snapshot.length).toBe(1);
    expect(snapshot[0].id).toBe(id);
    expect(snapshot[0].title).toBe("Rare New Yorker Literary Bookmark");

    // Accept the trade proposal
    await updateTradeProposalStatus(proposalId, "accepted");

    // Verify quantity decremented from 2 to 1
    const itemAfterAccept = await getNonBookstoreBookmarkById(id);
    expect(itemAfterAccept?.tradeQuantity).toBe(1);

    // Accepting again (e.g. status re-save) should not deduct again
    await updateTradeProposalStatus(proposalId, "accepted");
    const itemAfterSecondAccept = await getNonBookstoreBookmarkById(id);
    expect(itemAfterSecondAccept?.tradeQuantity).toBe(1);
  });
});
