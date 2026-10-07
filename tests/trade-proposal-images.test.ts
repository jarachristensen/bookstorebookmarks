import { describe, it, expect, beforeAll } from "vitest";
import { seedDatabase } from "@/db/seed";
import { createTradeProposal } from "@/lib/db/mutations";
import { getTradeProposalById } from "@/lib/db/queries";
import { POST as handleTradePost } from "@/app/api/trades/route";
import { POST as handleUploadPost } from "@/app/api/trades/upload/route";
import { NextRequest } from "next/server";

describe("Trade Proposals with Collector Uploaded Images", () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it("stores and retrieves offeredImages in trade proposals", async () => {
    const id = await createTradeProposal({
      collectorName: "Alice Walker",
      collectorEmail: "alice@example.com",
      offeredItems: "1970s City Lights bookmark and 1980s Strand card",
      offeredImages: [
        "/uploads/trades/trade-citylights-1.jpg",
        "/uploads/trades/trade-strand-2.jpg",
      ],
      requestedBookmarkIds: ["bm-1"],
    });

    expect(id).toBeDefined();

    const proposal = await getTradeProposalById(id);
    expect(proposal).toBeDefined();
    expect(proposal?.collectorName).toBe("Alice Walker");
    expect(proposal?.offeredImages).toBeDefined();

    const images = JSON.parse(proposal!.offeredImages!);
    expect(images).toHaveLength(2);
    expect(images[0]).toBe("/uploads/trades/trade-citylights-1.jpg");
    expect(images[1]).toBe("/uploads/trades/trade-strand-2.jpg");
  });

  it("accepts offeredImages via POST /api/trades endpoint", async () => {
    const req = new NextRequest("http://localhost:3000/api/trades", {
      method: "POST",
      body: JSON.stringify({
        collectorName: "Bob Smith",
        collectorEmail: "bob@example.com",
        offeredItems: "Powell's vintage bookmark",
        offeredImages: ["https://example.com/powells-photo.jpg"],
        requestedBookmarkIds: ["bm-1"],
      }),
    });

    const res = await handleTradePost(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);

    const proposal = await getTradeProposalById(data.id);
    expect(proposal?.offeredImages).toBeDefined();
    const images = JSON.parse(proposal!.offeredImages!);
    expect(images[0]).toBe("https://example.com/powells-photo.jpg");
  });

  it("handles image file upload via POST /api/trades/upload", async () => {
    const formData = new FormData();
    const file = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "my-bookmark.png", {
      type: "image/png",
    });
    if (!file.arrayBuffer) {
      file.arrayBuffer = async () => new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer;
    }
    formData.append("file", file);

    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await handleUploadPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBeDefined();
    expect(data.url).toMatch(/^\/(uploads\/trades|https:\/\/)/);
  });

  it("rejects non-image uploads on /api/trades/upload", async () => {
    const formData = new FormData();
    const file = new File(["malicious text"], "script.exe", {
      type: "application/x-msdownload",
    });
    formData.append("file", file);

    const req = {
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await handleUploadPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Only image files/i);
  });
});
