import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TradingHubClient } from "@/components/trading/TradingHubClient";
import { OtherBookmarksHubClient } from "@/components/trading/OtherBookmarksHubClient";

// Mock router & navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/trading",
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("Bazaar Multiple Copies Trade Quantity Selection", () => {
  const mockBookmark: any = {
    id: "bm-trade-multi",
    title: "City Lights Bookseller Bookmark",
    accessionNo: "BM-042",
    bookstoreId: "store-city-lights",
    frontImageUrl: "/test.jpg",
    backImageUrl: null,
    condition: "Fine",
    material: "Cardstock",
    dimensions: '2" × 7"',
    tradeQuantity: 3,
    bookstore: {
      id: "store-city-lights",
      name: "City Lights Books",
      city: "San Francisco",
      stateProvince: "CA",
      country: "USA",
      yearOpened: 1953,
      isStillOperating: true,
      archivalMedia: [],
    },
  };

  it("increments and decrements trade quantity directly on bookmark card up to available inventory", async () => {
    render(
      <TradingHubClient
        initialBookmarks={[mockBookmark]}
        initialContent={{}}
      />
    );

    // 1. Initial state: "+ Add" button is present on the card
    const addBtn = screen.getByRole("button", { name: /add/i });
    expect(addBtn).toBeDefined();
    fireEvent.click(addBtn);

    // 2. Button turns into stepper with quantity 1
    const qtyBadge = screen.getByTestId("qty-bm-trade-multi");
    expect(qtyBadge.textContent).toBe("1");

    // 3. Click + to increment to 2
    const incBtn = screen.getByRole("button", { name: /increase city lights bookseller bookmark quantity/i });
    fireEvent.click(incBtn);
    expect(qtyBadge.textContent).toBe("2");

    // 4. Click + to increment to 3 (max inventory)
    fireEvent.click(incBtn);
    expect(qtyBadge.textContent).toBe("3");
    expect(incBtn.hasAttribute("disabled")).toBe(true);

    // 5. Click − to decrement back to 2
    const decBtn = screen.getByRole("button", { name: /decrease city lights bookseller bookmark quantity/i });
    fireEvent.click(decBtn);
    expect(qtyBadge.textContent).toBe("2");
    expect(incBtn.hasAttribute("disabled")).toBe(false);

    // 6. Click − to decrement back to 1
    fireEvent.click(decBtn);
    expect(qtyBadge.textContent).toBe("1");

    // 7. Click − when at 1 removes bookmark from tray and restores "+ Add" button
    fireEvent.click(decBtn);
    expect(screen.queryByTestId("qty-bm-trade-multi")).toBeNull();
    expect(screen.getByRole("button", { name: /add/i })).toBeDefined();
  });

  it("disables the + button when only 1 copy is available", async () => {
    const singleCopyBookmark = {
      ...mockBookmark,
      id: "bm-single-copy",
      title: "Unique Strand Bookmark",
      tradeQuantity: 1,
    };

    render(
      <TradingHubClient
        initialBookmarks={[singleCopyBookmark]}
        initialContent={{}}
      />
    );

    // Click "+ Add"
    const addBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addBtn);

    // Stepper shows 1
    const qtyBadge = screen.getByTestId("qty-bm-single-copy");
    expect(qtyBadge.textContent).toBe("1");

    // + button is disabled because only 1 copy is available
    const incBtn = screen.getByRole("button", { name: /increase unique strand bookmark quantity/i });
    expect(incBtn.hasAttribute("disabled")).toBe(true);
  });

  it("submits trade proposal with chosen copy quantities in payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = fetchMock;

    render(
      <TradingHubClient
        initialBookmarks={[mockBookmark]}
        initialContent={{}}
      />
    );

    // Add and increment to 3
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    const incBtn = screen.getByRole("button", { name: /increase city lights bookseller bookmark quantity/i });
    fireEvent.click(incBtn);
    fireEvent.click(incBtn);

    // Open proposal modal
    const proposeBtn = screen.getByRole("button", { name: /propose trade/i });
    fireEvent.click(proposeBtn);

    // Fill form inputs
    fireEvent.change(screen.getByPlaceholderText(/jane doe/i), {
      target: { value: "Alice Collector" },
    });
    fireEvent.change(screen.getByPlaceholderText(/collector@example.com/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/describe the bookstore bookmarks/i), {
      target: { value: "Two vintage Strand bookmarks" },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /send trade proposal/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.requestedBookmarksSnapshot[0].quantity).toBe(3);
    expect(body.requestedBookmarksSnapshot[0].id).toBe("bm-trade-multi");
  });

  it("manages quantity controls in OtherBookmarksHubClient", async () => {
    const mockOtherBookmark: any = {
      id: "other-1",
      title: "New York Public Library Card",
      category: "Libraries",
      frontImageUrl: "/nypl.jpg",
      backImageUrl: null,
      tradeQuantity: 2,
    };

    render(
      <OtherBookmarksHubClient
        initialBookmarks={[mockOtherBookmark]}
        initialContent={{}}
      />
    );

    // Select bookmark card
    const selectBtn = screen.getByRole("button", { name: /\+ add to swap/i });
    fireEvent.click(selectBtn);

    // Open proposal modal
    const proposeBtn = screen.getByRole("button", { name: /propose trade/i });
    fireEvent.click(proposeBtn);

    // Verify quantity controls inside modal
    const qtyBadge = screen.getByTestId("qty-other-1");
    expect(qtyBadge.textContent).toBe("1");

    const incBtn = screen.getByRole("button", { name: /increase new york public library card quantity/i });
    fireEvent.click(incBtn);
    expect(qtyBadge.textContent).toBe("2");
    expect(incBtn.hasAttribute("disabled")).toBe(true);

    const decBtn = screen.getByRole("button", { name: /decrease new york public library card quantity/i });
    fireEvent.click(decBtn);
    expect(qtyBadge.textContent).toBe("1");
    expect(decBtn.hasAttribute("disabled")).toBe(true);
  });
});
