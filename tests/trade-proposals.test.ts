import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import {
  createTradeProposal,
  updateTradeProposalStatus,
  deleteTradeProposal,
  saveBookmarkAndBookstore,
} from "@/lib/db/mutations";
import {
  getAllTradeProposals,
  getTradeProposalById,
  getBookmarkBySlug,
  getTradeBookmarks,
} from "@/lib/db/queries";
import { POST as postTrade } from "@/app/api/trades/route";
import { PATCH as patchTrade } from "@/app/api/trades/[id]/route";
import { NextRequest } from "next/server";

describe("Trade Proposals & Duplicate Inventory Management", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("should create a trade proposal with requested bookmarks snapshot", async () => {
    const timestamp = Date.now();
    const bmId = `test-trade-bm-${timestamp}`;

    await saveBookmarkAndBookstore({
      bookmark: {
        id: bmId,
        title: "Test Rare Trade Bookmark",
        accessionNo: `BM-TEST-${timestamp}`,
        tradeQuantity: 2,
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Cardstock",
        dimensions: '2.25" × 7.5"',
        condition: "Fine",
      },
      bookstore: {
        name: `Test Trade Bookstore ${timestamp}`,
        city: "Seattle",
        country: "United States",
        yearOpened: 1975,
        historicalBlurb: "Test blurb",
      },
    });

    const proposalId = await createTradeProposal({
      collectorName: "Alice Collector",
      collectorEmail: "alice@example.com",
      offeredItems: "1982 City Lights Books bookmark + 1970s Powell's slip",
      requestedBookmarkIds: [bmId],
    });

    expect(proposalId).toBeDefined();

    const proposal = await getTradeProposalById(proposalId);
    expect(proposal).toBeDefined();
    expect(proposal?.collectorName).toBe("Alice Collector");
    expect(proposal?.collectorEmail).toBe("alice@example.com");
    expect(proposal?.status).toBe("pending");

    const snapshot = JSON.parse(proposal!.requestedBookmarksSnapshot);
    expect(Array.isArray(snapshot)).toBe(true);
    expect(snapshot[0]?.id).toBe(bmId);
    expect(snapshot[0]?.title).toBe("Test Rare Trade Bookmark");
  });

  it("should automatically deduct duplicate inventory when a trade proposal is accepted", async () => {
    const timestamp = Date.now();
    const bm1Id = `test-deduct-bm1-${timestamp}`;
    const bm2Id = `test-deduct-bm2-${timestamp}`;

    // Bookmark 1 has tradeQuantity: 2
    await saveBookmarkAndBookstore({
      bookmark: {
        id: bm1Id,
        title: "Deduct Test Bookmark 1",
        accessionNo: `BM-DED1-${timestamp}`,
        tradeQuantity: 2,
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Cardstock",
        dimensions: '2.25" × 7.5"',
        condition: "Fine",
      },
      bookstore: {
        name: `Store 1 ${timestamp}`,
        city: "Chicago",
        country: "United States",
        yearOpened: 1980,
        historicalBlurb: "Test blurb",
      },
    });

    // Bookmark 2 has tradeQuantity: 1
    await saveBookmarkAndBookstore({
      bookmark: {
        id: bm2Id,
        title: "Deduct Test Bookmark 2",
        accessionNo: `BM-DED2-${timestamp}`,
        tradeQuantity: 1,
        frontImageUrl: "/seed-images/gotham-front.svg",
        material: "Cardstock",
        dimensions: '2.25" × 7.5"',
        condition: "Fine",
      },
      bookstore: {
        name: `Store 2 ${timestamp}`,
        city: "Denver",
        country: "United States",
        yearOpened: 1990,
        historicalBlurb: "Test blurb",
      },
    });

    // Create proposal requesting both bookmarks
    const proposalId = await createTradeProposal({
      collectorName: "Bob Ephemera",
      collectorEmail: "bob@example.com",
      offeredItems: "Vintage Boston Book Row ephemera",
      requestedBookmarkIds: [bm1Id, bm2Id],
    });

    // Accept the trade proposal
    const success = await updateTradeProposalStatus(proposalId, "accepted");
    expect(success).toBe(true);

    const updatedProposal = await getTradeProposalById(proposalId);
    expect(updatedProposal?.status).toBe("accepted");

    // Verify bm1 quantity decremented from 2 -> 1
    const bm1After = await getBookmarkBySlug(bm1Id);
    expect(bm1After?.tradeQuantity).toBe(1);

    // Verify bm2 quantity decremented from 1 -> 0
    const bm2After = await getBookmarkBySlug(bm2Id);
    expect(bm2After?.tradeQuantity).toBe(0);

    // Verify bm2 is now excluded from public trade duplicates list
    const tradeInventory = await getTradeBookmarks();
    expect(tradeInventory.some((b) => b.id === bm1Id)).toBe(true); // still has 1 copy
    expect(tradeInventory.some((b) => b.id === bm2Id)).toBe(false); // 0 copies left
  });

  it("should validate and create trade proposal via POST /api/trades", async () => {
    const req = new NextRequest("http://localhost:3000/api/trades", {
      method: "POST",
      body: JSON.stringify({
        collectorName: "Charlie",
        collectorEmail: "charlie@books.com",
        offeredItems: "Shakespeare and Company bookmark",
        requestedBookmarkIds: ["some-id"],
      }),
    });

    const res = await postTrade(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();

    // Clean up
    await deleteTradeProposal(data.id);
  });

  it("should reject invalid submissions missing required fields", async () => {
    const req = new NextRequest("http://localhost:3000/api/trades", {
      method: "POST",
      body: JSON.stringify({
        collectorName: "",
        collectorEmail: "invalid-email",
        offeredItems: "",
        requestedBookmarkIds: [],
      }),
    });

    const res = await postTrade(req);
    expect(res.status).toBe(400);
  });
});
