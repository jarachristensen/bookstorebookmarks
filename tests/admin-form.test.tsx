import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookmarkForm } from "@/components/admin/BookmarkForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("BookmarkForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all main input sections and controls", () => {
    render(<BookmarkForm />);

    expect(screen.getByText(/1. Bookmark Specimen/i)).toBeDefined();
    expect(screen.getByText(/2. Associated Bookstore Research Dossier/i)).toBeDefined();
    expect(screen.getByText(/Bookmark Front Scan/i)).toBeDefined();
    const matches = screen.getAllByPlaceholderText(/e.g. Gotham Book Mart/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("should show validation error if user submits without frontImageUrl", async () => {
    render(<BookmarkForm />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Please upload at least the front bookmark scan/i)
      ).toBeDefined();
    });
  });

  it("should submit successfully when all required fields and frontImageUrl are provided", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/bookstores")) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        });
      }
      if (url === "/api/bookmarks") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "bm-123" }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as any;

    const initialData = {
      bookmark: {
        title: "City Lights Bookmark",
        frontImageUrl: "https://example.com/front.webp",
        backImageUrl: "",
        yearProduced: 1970,
        material: "Paper",
        dimensions: '2" × 7"',
        condition: "Fine",
        acquisitionDate: "",
        acquisitionNotes: "",
        isFeatured: false,
        displayOrder: 0,
        accentColor: "#881337",
      },
      bookstore: {
        name: "City Lights",
        city: "San Francisco",
        stateProvince: "CA",
        country: "United States",
        streetAddress: "261 Columbus Ave",
        yearOpened: 1953,
        yearClosed: "",
        isStillOperating: true,
        founders: "Lawrence Ferlinghetti",
        specialties: "Poetry",
        historicalBlurb: "Iconic bookstore",
        notablePatronsTrivia: "Beat poets",
        websiteUrl: "https://citylights.com",
      },
      archivalMedia: [],
    };

    render(<BookmarkForm initialData={initialData} />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/bookmarks",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });
});
