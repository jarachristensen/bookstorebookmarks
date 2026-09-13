import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BookstoresDirectoryClient } from "@/components/bookstores/BookstoresDirectoryClient";
import { BookstoreWithDetails } from "@/lib/db/queries";

const mockBookstores: BookstoreWithDetails[] = [
  {
    id: "city-lights-booksellers",
    name: "City Lights Booksellers & Publishers",
    city: "San Francisco",
    stateProvince: "CA",
    country: "United States",
    streetAddress: "261 Columbus Ave",
    yearOpened: 1953,
    yearClosed: null,
    isStillOperating: true,
    founders: "Lawrence Ferlinghetti, Peter D. Martin",
    specialties: JSON.stringify(["Beat Poetry", "Progressive Politics"]),
    historicalBlurb: "Founded in 1953 in San Francisco's North Beach neighborhood.",
    notablePatronsTrivia: null,
    websiteUrl: "https://citylights.com",
    locations: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bookmarks: [],
    archivalMedia: [],
  },
  {
    id: "a-clean-well-lighted-place",
    name: "A Clean Well-Lighted Place For Books",
    city: "San Francisco",
    stateProvince: "CA",
    country: "United States",
    streetAddress: "601 Van Ness Ave",
    yearOpened: 1975,
    yearClosed: 2006,
    isStillOperating: false,
    founders: "Lewis Buzbee",
    specialties: null,
    historicalBlurb: "Beloved literary salon near SF Civic Center.",
    notablePatronsTrivia: null,
    websiteUrl: null,
    locations: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bookmarks: [],
    archivalMedia: [],
  },
];

describe("BookstoresDirectoryClient Component", () => {
  it("renders simplified condensed bookstore cards with diecut storefronts, status badges, and active years", () => {
    render(
      <BookstoresDirectoryClient
        bookstores={mockBookstores}
        availableStorefronts={["citylightsbooksellers-storefront.png"]}
      />
    );

    // Verify bookstore names
    expect(screen.getByText("City Lights Booksellers & Publishers")).toBeDefined();
    expect(screen.getByText("A Clean Well-Lighted Place For Books")).toBeDefined();

    // Verify status badges
    expect(screen.getByText("STILL OPERATING")).toBeDefined();
    expect(screen.getByText("CLOSED (2006)")).toBeDefined();

    // Verify location strings
    const locationElements = screen.getAllByText(/San Francisco, CA, United States/i);
    expect(locationElements.length).toBe(2);

    // Verify active years
    expect(screen.getByText("1953–Present")).toBeDefined();
    expect(screen.getByText("1975–2006")).toBeDefined();

    // Verify State filter is present
    expect(screen.getByText("All States")).toBeDefined();
    expect(screen.getByText("CA")).toBeDefined();
  });
});
