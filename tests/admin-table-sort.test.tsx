import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminTableClient } from "@/app/admin/AdminTableClient";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("Curator Cabinet Bookmarks Table Default Ordering", () => {
  const mockBookstore: any = {
    id: "bs-1",
    name: "Powell's Books",
    city: "Portland",
    stateProvince: "OR",
    country: "USA",
    yearOpened: 1971,
    isStillOperating: true,
    archivalMedia: [],
  };

  const mockBookmarks: any[] = [
    {
      id: "bm-old",
      title: "Oldest Added Bookmark",
      slug: "oldest-added",
      bookstoreId: "bs-1",
      bookstore: mockBookstore,
      frontImageUrl: "/test1.jpg",
      createdAt: "2024-01-01T00:00:00.000Z",
      displayOrder: 1,
    },
    {
      id: "bm-new",
      title: "Newest Added Bookmark",
      slug: "newest-added",
      bookstoreId: "bs-1",
      bookstore: mockBookstore,
      frontImageUrl: "/test2.jpg",
      createdAt: "2026-10-15T12:00:00.000Z",
      displayOrder: 2,
    },
    {
      id: "bm-mid",
      title: "Middle Added Bookmark",
      slug: "middle-added",
      bookstoreId: "bs-1",
      bookstore: mockBookstore,
      frontImageUrl: "/test3.jpg",
      createdAt: "2025-06-01T00:00:00.000Z",
      displayOrder: 3,
    },
  ];

  it("renders bookmarks ordered by most recently added (createdAt DESC) by default", () => {
    // Sort input as app/admin/page.tsx does
    const sorted = [...mockBookmarks].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    render(
      <AdminTableClient
        initialBookmarks={sorted}
        initialBookstores={[mockBookstore]}
        initialTradeProposals={[]}
        initialOtherBookmarks={[]}
        initialOtherBookmarkTags={[]}
      />
    );

    const rows = screen.getAllByRole("row");
    // Row 0 is header row
    expect(rows[1].textContent).toContain("Newest Added Bookmark");
    expect(rows[2].textContent).toContain("Middle Added Bookmark");
    expect(rows[3].textContent).toContain("Oldest Added Bookmark");
  });
});
