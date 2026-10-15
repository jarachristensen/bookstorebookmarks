import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookstoreVerticalTimeline } from "@/components/bookstores/BookstoreVerticalTimeline";

describe("BookstoreVerticalTimeline Component", () => {
  const mockBookstore: any = {
    id: "bs-1",
    name: "City Lights Booksellers",
    city: "San Francisco",
    yearOpened: 1953,
    isStillOperating: true,
    locations: null,
    archivalMedia: [
      {
        id: "media-1",
        imageUrl: "/uploads/storefront-1953.jpg",
        caption: "City Lights Storefront",
        publicationDate: "1953",
        isStorefront: true,
      },
    ],
    timelineEvents: JSON.stringify([
      {
        id: "ev-1",
        year: 1953,
        label: "Grand Opening on Columbus Ave",
        description: "Founded by Lawrence Ferlinghetti and Peter D. Martin.",
        type: "opening",
        mediaId: "media-1",
      },
      {
        id: "ev-2",
        year: 1957,
        label: "Howl Obscenity Trial Victory",
        description: "Municipal court acquits publisher of obscenity charges.",
        type: "press",
      },
    ]),
  };

  it("renders antique TIMELINE header and clean year badges without the word Year", () => {
    render(<BookstoreVerticalTimeline bookstore={mockBookstore} />);

    expect(screen.getByText("TIMELINE")).toBeDefined();
    expect(screen.getByText("1953")).toBeDefined();
    expect(screen.getByText("1957")).toBeDefined();
    expect(screen.queryByText("Year 1953")).toBeNull();
  });

  it("expands text across the step when an event has no media", () => {
    render(<BookstoreVerticalTimeline bookstore={mockBookstore} />);

    expect(screen.getByText("Howl Obscenity Trial Victory")).toBeDefined();
    expect(screen.getByText(/Municipal court acquits/i)).toBeDefined();
  });

  it("triggers media selection when thumbnail is clicked", () => {
    const onSelectMedia = vi.fn();
    render(
      <BookstoreVerticalTimeline
        bookstore={mockBookstore}
        onSelectMedia={onSelectMedia}
      />
    );

    const thumbnail = screen.getByAltText(/City Lights Storefront/i);
    fireEvent.click(thumbnail);
    expect(onSelectMedia).toHaveBeenCalled();
  });
});
