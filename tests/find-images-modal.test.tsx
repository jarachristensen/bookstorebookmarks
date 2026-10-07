import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FindImagesModal } from "@/components/admin/FindImagesModal";
import { GET } from "@/app/api/bookstores/search-images/route";
import { NextRequest } from "next/server";

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("FindImagesModal Component", () => {
  it("renders search input with initial query and searches", async () => {
    const onAddImages = vi.fn();
    const onClose = vi.fn();

    // Mock global fetch for the modal
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: "commons-123",
            title: "Powell's Books Corner View",
            url: "https://example.com/powells.jpg",
            thumbnailUrl: "https://example.com/powells-thumb.jpg",
            source: "Wikimedia Commons",
            year: "1985",
            description: "View from Burnside",
          },
        ],
      }),
    } as any);

    render(
      <FindImagesModal
        isOpen={true}
        onClose={onClose}
        initialQuery="Powell's Books Portland"
        bookstoreName="Powell's Books"
        onAddImages={onAddImages}
      />
    );

    expect(screen.getByText("Find Web & Archival Images")).toBeDefined();
    expect(screen.getByDisplayValue("Powell's Books Portland")).toBeDefined();

    // Wait for the mock results to populate
    await waitFor(() => {
      expect(screen.getByText("Powell's Books Corner View")).toBeDefined();
    });

    expect(screen.getByText("Wikimedia Commons")).toBeDefined();
    expect(screen.getByText("1985")).toBeDefined();

    // Select the image
    fireEvent.click(screen.getByText("Powell's Books Corner View"));

    // Click Add Selected button
    const addButton = screen.getByText(/Add 1 Selected to Bookstore Profile/i);
    fireEvent.click(addButton);

    expect(onAddImages).toHaveBeenCalledWith([
      {
        url: "https://example.com/powells.jpg",
        title: "Powell's Books Corner View",
        year: "1985",
        source: "Wikimedia Commons",
        description: "View from Burnside",
        mediaTag: "storefront",
      },
    ]);
    expect(onClose).toHaveBeenCalled();

    global.fetch = originalFetch;
  });

  it("handles empty search query gracefully", () => {
    const onAddImages = vi.fn();
    const onClose = vi.fn();

    render(
      <FindImagesModal
        isOpen={true}
        onClose={onClose}
        initialQuery=""
        bookstoreName="Empty Test"
        onAddImages={onAddImages}
      />
    );

    expect(screen.getByText("Find Web & Archival Images")).toBeDefined();
  });
});

describe("GET /api/bookstores/search-images", () => {
  it("rejects unauthorized access without curator session", async () => {
    const req = new NextRequest("http://localhost:3000/api/bookstores/search-images?q=test");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
