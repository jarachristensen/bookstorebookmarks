import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TradingHubClient } from "@/components/trading/TradingHubClient";
import { BookmarkWithDetails } from "@/lib/db/queries";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/trading",
  useSearchParams: () => new URLSearchParams(""),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockTradeBookmarks: BookmarkWithDetails[] = [
  {
    id: "bm-trade-1",
    bookstoreId: "store-1",
    title: "City Lights Booksellers & Publishers",
    accessionNo: "BM-1001",
    frontImageUrl: "/images/bookmarks/city-lights-front.png",
    backImageUrl: "/images/bookmarks/city-lights-back.png",
    yearProduced: 1974,
    material: "Cardstock",
    dimensions: '2.25" × 7.5"',
    condition: "Fine",
    acquisitionDate: "2023-01-01",
    acquisitionNotes: "Duplicate copy",
    isFeatured: false,
    tradeQuantity: 3,
    displayOrder: 1,
    accentColor: "#881337",
    createdAt: 1000,
    updatedAt: 1000,
    bookstore: {
      id: "store-1",
      name: "City Lights Books",
      city: "San Francisco",
      stateProvince: "CA",
      country: "United States",
      streetAddress: "261 Columbus Ave",
      locations: null,
      timelineEvents: null,
      isFlagship: true,
      flagshipId: null,
      chainName: null,
      branchLabel: null,
      yearOpened: 1953,
      yearClosed: null,
      isStillOperating: true,
      founders: "Lawrence Ferlinghetti",
      specialties: '["Poetry", "Beat Literature"]',
      historicalBlurb: "Iconic bookstore in SF",
      notablePatronsTrivia: '["Allen Ginsberg"]',
      websiteUrl: "https://citylights.com",
      createdAt: 1000,
      updatedAt: 1000,
      archivalMedia: [],
    },
  },
  {
    id: "bm-trade-2",
    bookstoreId: "store-2",
    title: "Strand Book Store '18 Miles of Books'",
    accessionNo: "BM-1002",
    frontImageUrl: "/images/bookmarks/strand-front.png",
    backImageUrl: null,
    yearProduced: 1982,
    material: "Heavy Cardstock",
    dimensions: '2.0" × 8.0"',
    condition: "Mint",
    acquisitionDate: "2023-02-01",
    acquisitionNotes: "Extra copy",
    isFeatured: true,
    tradeQuantity: 1,
    displayOrder: 2,
    accentColor: "#2563EB",
    createdAt: 1000,
    updatedAt: 1000,
    bookstore: {
      id: "store-2",
      name: "Strand Book Store",
      city: "New York",
      stateProvince: "NY",
      country: "United States",
      streetAddress: "828 Broadway",
      locations: null,
      timelineEvents: null,
      isFlagship: true,
      flagshipId: null,
      chainName: null,
      branchLabel: null,
      yearOpened: 1927,
      yearClosed: null,
      isStillOperating: true,
      founders: "Ben Bass",
      specialties: '["Rare Books", "Used Books"]',
      historicalBlurb: "Legendary Broadway bookseller",
      notablePatronsTrivia: '["Patti Smith"]',
      websiteUrl: "https://strandbooks.com",
      createdAt: 1000,
      updatedAt: 1000,
      archivalMedia: [],
    },
  },
  {
    id: "bm-trade-3",
    bookstoreId: "store-3",
    title: "Powell's City of Books Wide Bookmark",
    accessionNo: "BM-1003",
    frontImageUrl: "/images/bookmarks/powells-front.png",
    backImageUrl: null,
    yearProduced: 1990,
    material: "Glossy Cardstock",
    dimensions: '7.5" × 2.25"',
    condition: "Near Mint",
    acquisitionDate: "2023-03-01",
    acquisitionNotes: "Horizontal specimen",
    isFeatured: false,
    tradeQuantity: 2,
    displayOrder: 3,
    accentColor: "#F43F7A",
    createdAt: 1000,
    updatedAt: 1000,
    bookstore: {
      id: "store-3",
      name: "Powell's Books",
      city: "Portland",
      stateProvince: "OR",
      country: "United States",
      streetAddress: "1005 W Burnside St",
      locations: null,
      timelineEvents: null,
      isFlagship: true,
      flagshipId: null,
      chainName: null,
      branchLabel: null,
      yearOpened: 1971,
      yearClosed: null,
      isStillOperating: true,
      founders: "Walter Powell",
      specialties: '["New & Used Books"]',
      historicalBlurb: "Famous Portland bookstore",
      notablePatronsTrivia: '[]',
      websiteUrl: "https://powells.com",
      createdAt: 1000,
      updatedAt: 1000,
      archivalMedia: [],
    },
  },
];

describe("TradingHubClient Component", () => {
  it("renders duplicate bookmarks with copy count badges and portrait/landscape cards", () => {
    render(<TradingHubClient initialBookmarks={mockTradeBookmarks} />);

    // Check titles
    expect(screen.getByText("City Lights Booksellers & Publishers")).toBeDefined();
    expect(screen.getByText("Strand Book Store '18 Miles of Books'")).toBeDefined();
    expect(screen.getByText("Powell's City of Books Wide Bookmark")).toBeDefined();

    // Check duplicate quantity badges
    expect(screen.getByText("✕ 3")).toBeDefined();
    expect(screen.getByText("✕ 1")).toBeDefined();
    expect(screen.getByText("✕ 2")).toBeDefined();
  });

  it("filters duplicates by search query", () => {
    render(<TradingHubClient initialBookmarks={mockTradeBookmarks} />);

    const searchInput = screen.getByPlaceholderText(/Search duplicates by bookstore/i);
    fireEvent.change(searchInput, { target: { value: "Strand" } });

    expect(screen.getByText("Strand Book Store '18 Miles of Books'")).toBeDefined();
    expect(screen.queryByText("City Lights Booksellers & Publishers")).toBeNull();
  });

  it("adds bookmark to trade tray and displays floating bottom drawer", async () => {
    render(<TradingHubClient initialBookmarks={mockTradeBookmarks} />);

    // Bottom tray should not be visible initially
    expect(screen.queryByText(/in Trade Tray/i)).toBeNull();

    // Click "+ Add" button for City Lights
    const addButtons = screen.getAllByRole("button", { name: /^Add$/i });
    fireEvent.click(addButtons[0]);

    // Bottom tray should now appear with 1 Bookmark
    expect(screen.getByText("1 Bookmark in Trade Tray")).toBeDefined();
    expect(screen.getByRole("button", { name: /Propose Trade \(1\)/i })).toBeDefined();

    // Click second bookmark
    const addSecond = screen.getAllByRole("button", { name: /^Add$/i });
    fireEvent.click(addSecond[0]); // first remaining unselected

    expect(screen.getByText("2 Bookmarks in Trade Tray")).toBeDefined();
    expect(screen.getByRole("button", { name: /Propose Trade \(2\)/i })).toBeDefined();
  });

  it("opens BookmarkInspector modal on card/title click and allows 3D flipping", async () => {
    render(<TradingHubClient initialBookmarks={mockTradeBookmarks} />);

    // Click on the title of City Lights
    const titleEl = screen.getByText("City Lights Booksellers & Publishers");
    fireEvent.click(titleEl);

    // Inspector modal should be open showing specifications and flip trigger
    expect(screen.getByText("Physical Specimen Specifications")).toBeDefined();
    expect(screen.getByRole("button", { name: /Flip to Verso \(Back\)/i })).toBeDefined();

    // Click flip button
    const flipButton = screen.getByRole("button", { name: /Flip to Verso \(Back\)/i });
    fireEvent.click(flipButton);

    expect(screen.getByRole("button", { name: /Flip to Recto \(Front\)/i })).toBeDefined();

    // Close modal
    const closeBtn = screen.getByLabelText(/Close Inspector/i);
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("Physical Specimen Specifications")).toBeNull();
    });
  });

  it("allows adding to trade and adjusting quantity from within BookmarkInspector modal", async () => {
    render(<TradingHubClient initialBookmarks={mockTradeBookmarks} />);

    // Open inspector for Powell's
    fireEvent.click(screen.getByText("Powell's City of Books Wide Bookmark"));

    // Verify Add to Trade Tray button is present in the inspector
    const modalAddBtn = screen.getByRole("button", { name: /\+ add to trade tray/i });
    expect(modalAddBtn).toBeDefined();

    // Verify bookstore history link is rendered as secondary link
    expect(screen.getByText(/view bookstore page & history/i)).toBeDefined();

    // Click Add to Trade Tray in the modal
    fireEvent.click(modalAddBtn);

    // Should now show in-modal stepper with quantity 1
    const modalQty = screen.getByTestId("inspector-qty-bm-trade-3");
    expect(modalQty.textContent).toBe("1");

    // Click + to increment
    const incBtn = screen.getByRole("button", { name: /increase powell's city of books wide bookmark quantity in inspector/i });
    fireEvent.click(incBtn);
    expect(modalQty.textContent).toBe("2");

    // Click − to decrement back to 1
    const decBtn = screen.getByRole("button", { name: /decrease powell's city of books wide bookmark quantity in inspector/i });
    fireEvent.click(decBtn);
    expect(modalQty.textContent).toBe("1");

    // Click − at 1 to remove from trade tray
    fireEvent.click(decBtn);
    expect(screen.getByRole("button", { name: /\+ add to trade tray/i })).toBeDefined();
  });

  it("renders the side column FAQ questions", () => {
    render(<TradingHubClient initialBookmarks={mockTradeBookmarks} />);

    expect(screen.getByText("What kind of bookmarks can I offer in trade?")).toBeDefined();
    expect(screen.getByText("What condition are these duplicate bookmarks in?")).toBeDefined();
  });

  it("renders the Top Traders leaderboard using initialLeaderboard prop", () => {
    render(
      <TradingHubClient
        initialBookmarks={mockTradeBookmarks}
        initialLeaderboard={[
          {
            collectorInitials: "J. D.",
            totalBookmarksTraded: 5,
            tradesCount: 2,
          },
        ]}
      />
    );

    expect(screen.getByText(/top traders/i)).toBeDefined();
    expect(screen.getByText(/collector j\. d\./i)).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText(/2 swaps completed/i)).toBeDefined();
  });
});
