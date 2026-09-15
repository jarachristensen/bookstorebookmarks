import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookstoreVisualEditor } from "@/components/admin/BookstoreVisualEditor";
import { BookstoreWithDetails } from "@/lib/db/queries";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockBookstore: BookstoreWithDetails = {
  id: "test-bookshop",
  name: "Test Vintage Bookshop",
  city: "Portland",
  stateProvince: "OR",
  country: "United States",
  streetAddress: "123 Main St",
  locations: null,
  timelineEvents: null,
  isFlagship: false,
  flagshipId: null,
  chainName: null,
  branchLabel: null,
  yearOpened: 1980,
  yearClosed: null,
  isStillOperating: true,
  founders: "Test Founder",
  specialties: JSON.stringify(["Rare Books"]),
  historicalBlurb: "A historic test bookstore.",
  notablePatronsTrivia: null,
  websiteUrl: "https://example.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookmarks: [],
  archivalMedia: [],
};

describe("BookstoreVisualEditor Deletion Flow", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any);
  });

  it("renders delete button and opens confirmation popup when clicked", () => {
    render(<BookstoreVisualEditor initialData={mockBookstore} />);

    // Find the Delete Bookstore button at the bottom
    const deleteButtons = screen.getAllByRole("button", { name: /delete bookstore/i });
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Click the delete button
    fireEvent.click(deleteButtons[0]);

    // Verify confirmation modal popup appears
    expect(screen.getByText(/this action cannot be undone/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /yes, delete bookstore/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDefined();

    // Click Cancel and verify modal closes
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/this action cannot be undone/i)).toBeNull();
  });
});
