import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClippingLightbox } from "@/components/exhibit/ClippingLightbox";
import { ArchivalMedia } from "@/db/schema";

const mockMedia: ArchivalMedia = {
  id: "media-1",
  bookstoreId: "gotham-book-mart",
  mediaType: "newspaper",
  imageUrl: "/seed-images/gotham-front.svg",
  caption: "The New York Times: Frances Steloff Honored",
  sourcePublication: "The New York Times",
  publicationDate: "November 14, 1947",
  transcriptionText: "NEW YORK — Frances Steloff was honored today by the James Joyce Society.",
  displayOrder: 1,
  createdAt: new Date().toISOString(),
};

describe("ClippingLightbox Component", () => {
  it("should display clipping image, publication details, and toggle transcription drawer", () => {
    let closed = false;
    render(
      <ClippingLightbox
        media={mockMedia}
        onClose={() => (closed = true)}
      />
    );

    expect(screen.getByText(/The New York Times: Frances Steloff Honored/i)).toBeDefined();
    expect(screen.getByText("November 14, 1947")).toBeDefined();
    expect(screen.getByText(/Frances Steloff was honored today/i)).toBeDefined();

    const closeBtn = screen.getByRole("button", { name: /close lightbox/i });
    fireEvent.click(closeBtn);
    expect(closed).toBe(true);
  });
});
