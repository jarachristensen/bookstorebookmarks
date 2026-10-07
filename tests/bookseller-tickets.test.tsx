import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BooksellerTicketsGalleryClient } from "@/components/tickets/BooksellerTicketsGalleryClient";
import { Header } from "@/components/ui/Header";
import { BookstoreDetailView } from "@/components/bookstores/BookstoreDetailView";
import { BookmarkWithDetails, BookstoreWithDetails } from "@/lib/db/queries";

describe("Bookseller Tickets Category & Views", () => {
  const mockTicket: BookmarkWithDetails = {
    id: "ticket-1",
    bookstoreId: "bs-1",
    title: "1885 Hatchards Piccadilly Bookseller Ticket",
    accessionNo: "BT-1885-01",
    frontImageUrl: "/seed-images/other/ticket-front.svg",
    backImageUrl: null,
    yearProduced: 1885,
    material: "Engraved Paper Label",
    dimensions: '1.25" × 1.75"',
    condition: "Fine",
    acquisitionDate: "2026-01-01",
    acquisitionNotes: "Found on front paste-down of Victorian volume",
    isFeatured: true,
    isBooksellerTicket: true,
    tradeQuantity: 0,
    displayOrder: 1,
    accentColor: "#2563EB",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    bookstore: {
      id: "bs-1",
      name: "Hatchards Piccadilly",
      city: "London",
      stateProvince: null,
      country: "United Kingdom",
      streetAddress: "187 Piccadilly",
      locations: null,
      timelineEvents: null,
      isFlagship: false,
      flagshipId: null,
      chainName: null,
      branchLabel: null,
      yearOpened: 1797,
      yearClosed: null,
      isStillOperating: true,
      founders: "John Hatchard",
      specialties: null,
      historicalBlurb: "The oldest bookshop in the United Kingdom.",
      notablePatronsTrivia: null,
      websiteUrl: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      archivalMedia: [],
    },
  };

  it("Header includes Bookseller Tickets navigation link", () => {
    render(<Header />);
    const ticketLink = screen.getByRole("link", { name: /Bookseller Tickets/i });
    expect(ticketLink).toBeDefined();
    expect(ticketLink.getAttribute("href")).toBe("/tickets");
  });

  it("BooksellerTicketsGalleryClient renders tickets and opens inspector on click", () => {
    render(<BooksellerTicketsGalleryClient tickets={[mockTicket]} />);

    expect(screen.getByRole("heading", { name: /Bookseller Tickets/i })).toBeDefined();
    const specimenCard = screen.getByLabelText(/Inspect 1885 Hatchards Piccadilly Bookseller Ticket/i);
    expect(specimenCard).toBeDefined();

    // Click ticket specimen to inspect
    fireEvent.click(specimenCard);

    // Inspector should open with material and details
    expect(screen.getByText("Engraved Paper Label")).toBeDefined();
  });

  it("BooksellerTicketsGalleryClient renders helpful empty state when 0 tickets exist", () => {
    render(<BooksellerTicketsGalleryClient tickets={[]} />);
    expect(screen.getByText(/No Bookseller Tickets Cataloged Yet/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /Go to Curator's Cabinet/i })).toBeDefined();
  });

  it("BookstoreDetailView exhibits ticket with badge next to bookstore bookmarks", () => {
    const mockBookstoreWithTicket: BookstoreWithDetails = {
      ...mockTicket.bookstore!,
      bookmarks: [mockTicket],
      archivalMedia: [],
    };

    render(
      <BookstoreDetailView
        bookstore={mockBookstoreWithTicket}
        availableStorefronts={[]}
      />
    );

    expect(screen.getByText(/Cataloged Bookmarks & Tickets/i)).toBeDefined();
    expect(screen.getByText("Ticket")).toBeDefined();
    expect(screen.getByText("1885 Hatchards Piccadilly Bookseller Ticket")).toBeDefined();
  });
});
