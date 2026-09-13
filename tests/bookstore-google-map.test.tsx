import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookstoreGoogleMap } from "@/components/bookstores/BookstoreGoogleMap";

describe("BookstoreGoogleMap Component", () => {
  const mockBookstoreSingleLocation = {
    name: "City Lights Booksellers",
    streetAddress: "261 Columbus Avenue",
    city: "San Francisco",
    stateProvince: "CA",
    country: "United States",
    locations: null,
  };

  const mockBookstoreMultiLocation = {
    name: "Gotham Book Mart",
    streetAddress: "41 West 47th Street",
    city: "New York",
    stateProvince: "NY",
    country: "United States",
    locations: JSON.stringify([
      {
        id: "loc-1",
        label: "1st Location",
        streetAddress: "128 West 45th Street",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        yearsActive: "1920–1923",
      },
      {
        id: "loc-2",
        label: "2nd Location",
        streetAddress: "51 West 47th Street",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        yearsActive: "1923–1946",
      },
      {
        id: "loc-3",
        label: "3rd Location (Diamond District)",
        streetAddress: "41 West 47th Street",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        yearsActive: "1946–2007",
      },
    ]),
  };

  it("renders single location address and iframe map", () => {
    render(<BookstoreGoogleMap bookstore={mockBookstoreSingleLocation} />);

    expect(screen.getByText("Historic Location & Map")).toBeDefined();
    expect(screen.getByText("261 Columbus Avenue")).toBeDefined();
    expect(screen.getByText("San Francisco, CA, United States")).toBeDefined();
    expect(screen.getByText("Open in Google Maps")).toBeDefined();
    expect(screen.getByText("Directions")).toBeDefined();
  });

  it("renders multi-location tabs and allows switching active address", () => {
    render(<BookstoreGoogleMap bookstore={mockBookstoreMultiLocation} />);

    expect(screen.getByText(/Historical Addresses & Relocations/i)).toBeDefined();
    expect(screen.getByText(/1st Location \(1920–1923\)/i)).toBeDefined();
    expect(screen.getByText(/2nd Location \(1923–1946\)/i)).toBeDefined();

    // Click 2nd location tab
    const secondLocTab = screen.getByText(/2nd Location \(1923–1946\)/i);
    fireEvent.click(secondLocTab);

    expect(screen.getByText("51 West 47th Street")).toBeDefined();
  });
});
