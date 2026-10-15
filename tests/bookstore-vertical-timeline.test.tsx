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

  it("renders continuous serpentine SVG line and alternating 60%/40% milestone nodes", () => {
    const { container } = render(<BookstoreVerticalTimeline bookstore={mockBookstore} />);

    const svgTrack = screen.getByTestId("serpentine-svg");
    expect(svgTrack).toBeDefined();

    const path = svgTrack.querySelector("path");
    expect(path).toBeDefined();

    // Check alternating node classes
    const nodes = container.querySelectorAll(".w-5.h-5.rounded-full");
    expect(nodes.length).toBe(2);
    // Node 1 container should have md:left-[60%]
    const node1Wrapper = nodes[0].closest(".absolute");
    expect(node1Wrapper?.className).toContain("md:left-[60%]");

    // Node 2 container should have md:left-[40%]
    const node2Wrapper = nodes[1].closest(".absolute");
    expect(node2Wrapper?.className).toContain("md:left-[40%]");
  });

  it("calls onDeleteEvent when milestone delete button is clicked in editable mode", () => {
    const onDeleteEvent = vi.fn();
    render(
      <BookstoreVerticalTimeline
        bookstore={mockBookstore}
        isEditable={true}
        onDeleteEvent={onDeleteEvent}
      />
    );

    const deleteButtons = screen.getAllByTitle("Delete milestone");
    expect(deleteButtons.length).toBe(2);

    fireEvent.click(deleteButtons[0]);
    expect(onDeleteEvent).toHaveBeenCalledWith("ev-1");
  });
});

