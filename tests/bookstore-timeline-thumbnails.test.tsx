import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookstoreHorizontalTimeline } from "@/components/bookstores/BookstoreHorizontalTimeline";
import { BookstoreWithDetails } from "@/lib/db/queries";

describe("BookstoreHorizontalTimeline Thumbnail & Zoom", () => {
  const mockBookstore: BookstoreWithDetails = {
    id: "bs-1",
    name: "City Lights Booksellers",
    slug: "city-lights-booksellers",
    city: "San Francisco",
    stateProvince: "CA",
    country: "United States",
    streetAddress: "261 Columbus Avenue",
    yearOpened: 1953,
    yearClosed: null,
    isStillOperating: true,
    historicalContext: "Iconic beat generation bookstore.",
    locations: null,
    notablePatronsTrivia: null,
    timelineEvents: null,
    archivalMedia: [
      {
        id: "m-1",
        bookstoreId: "bs-1",
        mediaType: "newspaper",
        imageUrl: "/uploads/newspaper-clipping-1956.jpg",
        caption: "Howl Obscenity Trial Coverage",
        sourcePublication: "San Francisco Chronicle",
        publicationDate: "1956",
        transcriptionText: "Police seize copies of Howl...",
        isStorefront: false,
        mediaTag: "press",
        displayOrder: 1,
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "m-2",
        bookstoreId: "bs-1",
        mediaType: "photo",
        imageUrl: "/uploads/storefront-photo-1953.jpg",
        caption: "Opening Day Storefront",
        sourcePublication: null,
        publicationDate: "1953",
        transcriptionText: null,
        isStorefront: true,
        mediaTag: "storefront",
        displayOrder: 0,
        createdAt: "2026-01-01T00:00:00Z",
      },
    ],
    bookmarks: [],
  };

  it("renders image & clipping thumbnails with zoom hover indicators", () => {
    render(<BookstoreHorizontalTimeline bookstore={mockBookstore} />);

    // Check for thumbnail images
    const thumbnails = screen.getAllByRole("img");
    expect(thumbnails.length).toBeGreaterThanOrEqual(1);

    const clippingImg = thumbnails.find((img) =>
      img.getAttribute("src")?.includes("newspaper-clipping-1956.jpg")
    );
    expect(clippingImg).toBeDefined();
  });

  it("triggers media selection when thumbnail is clicked", () => {
    const handleSelectMedia = vi.fn();
    render(
      <BookstoreHorizontalTimeline
        bookstore={mockBookstore}
        onSelectMedia={handleSelectMedia}
      />
    );

    // Click the clipping thumbnail button
    const clippingButton = screen.getByTitle(/Click to zoom clipping/i);
    fireEvent.click(clippingButton);

    expect(handleSelectMedia).toHaveBeenCalledTimes(1);
    expect(handleSelectMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "m-1",
        mediaType: "newspaper",
      })
    );
  });
});
