import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BookstoreDossier } from "@/components/exhibit/BookstoreDossier";
import { BookmarkWithDetails } from "@/lib/db/queries";

const mockBookmarkWithFullDossier: BookmarkWithDetails = {
  id: "gotham-wise-men-fish-here",
  bookstoreId: "gotham-book-mart",
  title: "Gotham Book Mart “Wise Men Fish Here”",
  accessionNo: "BM-1934-NY-01",
  frontImageUrl: "/seed-images/gotham-front.svg",
  backImageUrl: "/seed-images/gotham-back.svg",
  yearProduced: 1934,
  material: "Letterpress Cardstock",
  dimensions: "2.25\" × 7.75\"",
  condition: "Very Good",
  acquisitionDate: "1988-05-12",
  acquisitionNotes: "Acquired in NYC",
  isFeatured: true,
  displayOrder: 1,
  accentColor: "#881337",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookstore: {
    id: "gotham-book-mart",
    name: "Gotham Book Mart",
    city: "New York",
    stateProvince: "NY",
    country: "United States",
    streetAddress: "41 West 47th Street",
    yearOpened: 1920,
    yearClosed: 2007,
    isStillOperating: false,
    founders: "Frances Steloff",
    specialties: JSON.stringify(["Modernist Literature", "Poetry"]),
    historicalBlurb: "### Defying the Censors\n\nFrances Steloff founded the **James Joyce Society** in the back room.",
    notablePatronsTrivia: JSON.stringify([
      "Patti Smith worked as a clerk here.",
      "E.E. Cummings signed poetry at the counter."
    ]),
    websiteUrl: "https://www.library.upenn.edu/collections/gotham",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivalMedia: [
      {
        id: "media-1",
        bookstoreId: "gotham-book-mart",
        mediaType: "newspaper",
        imageUrl: "/seed-images/gotham-front.svg",
        caption: "NYT 1947: Frances Steloff Honored",
        sourcePublication: "The New York Times",
        publicationDate: "Nov 14, 1947",
        transcriptionText: "Full article transcription text here.",
        displayOrder: 1,
        createdAt: new Date().toISOString(),
      },
    ],
  },
};

describe("BookstoreDossier Component", () => {
  it("should render bookstore narrative, founders, specialties, and trivia", () => {
    render(
      <BookstoreDossier
        bookmark={mockBookmarkWithFullDossier}
        onClose={() => {}}
      />
    );

    expect(screen.getByText("Gotham Book Mart")).toBeDefined();
    const matches = screen.getAllByText(/Frances Steloff/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Modernist Literature")).toBeDefined();
    expect(screen.getByText(/Patti Smith worked as a clerk here/i)).toBeDefined();
    expect(screen.getByText(/NYT 1947: Frances Steloff Honored/i)).toBeDefined();
  });
});
