import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("AdminTableClient - Other Bookmarks Bulk Edit & ImageDropzone", () => {
  const sampleOtherBookmarks = [
    {
      id: "other-1",
      title: "Sample Library Slip",
      category: "Libraries",
      tags: JSON.stringify(["Libraries"]),
      frontImageUrl: "/seed-images/other-1.png",
      backImageUrl: null,
      tradeQuantity: 2,
      dimensions: '2" × 7"',
      material: "Cardstock",
      condition: "Fine",
      notes: null,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("toggles bulk edit mode and displays editable input for other bookmarks", async () => {
    render(
      <AdminTableClient
        initialBookmarks={[]}
        initialBookstores={[]}
        initialOtherBookmarks={sampleOtherBookmarks}
        initialOtherBookmarkTags={["Libraries", "Publishers", "Authors"]}
      />
    );

    // Switch to Other Bookmarks tab
    const otherTabBtn = screen.getByText(/Other Bookmarks/i);
    fireEvent.click(otherTabBtn);

    expect(screen.getByText("Sample Library Slip")).toBeDefined();

    // Verify "Bulk Edit" button is present and "Bulk Image Uploader" is gone
    const bulkEditBtn = screen.getByRole("button", { name: /bulk edit/i });
    expect(bulkEditBtn).toBeDefined();
    expect(screen.queryByText("Bulk Image Uploader")).toBeNull();

    // Click Bulk Edit
    fireEvent.click(bulkEditBtn);

    // Now an input with "Sample Library Slip" should be rendered
    const titleInput = screen.getByDisplayValue("Sample Library Slip");
    expect(titleInput).toBeDefined();

    // Cancel Bulk Edit
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    // Returns to normal view
    expect(screen.getByRole("button", { name: /bulk edit/i })).toBeDefined();
  });

  it("renders ImageDropzone components in the Add Single Other Bookmark modal", async () => {
    render(
      <AdminTableClient
        initialBookmarks={[]}
        initialBookstores={[]}
        initialOtherBookmarks={sampleOtherBookmarks}
        initialOtherBookmarkTags={["Libraries", "Publishers"]}
      />
    );

    // Switch to Other Bookmarks tab
    fireEvent.click(screen.getByText(/Other Bookmarks/i));

    // Click + Add Single
    const addSingleBtn = screen.getByRole("button", { name: /\+ add single/i });
    fireEvent.click(addSingleBtn);

    // Modal opens
    expect(screen.getByText("Add Other Bookmark")).toBeDefined();

    // Verify ImageDropzone labels are present instead of raw URL inputs
    expect(screen.getByText(/Front Bookmark Scan/i)).toBeDefined();
    expect(screen.getByText(/Back \/ Verso Scan/i)).toBeDefined();
    expect(screen.getAllByText(/Click or drop scan here/i).length).toBeGreaterThan(0);

  });
});
