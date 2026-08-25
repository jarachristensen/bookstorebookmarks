import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BookmarkForm } from "@/components/admin/BookmarkForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("BookmarkForm Component", () => {
  it("should render all main input sections and controls", () => {
    render(<BookmarkForm />);

    expect(screen.getByText(/1. Bookmark Specimen & Scans/i)).toBeDefined();
    expect(screen.getByText(/2. Associated Bookstore Research Dossier/i)).toBeDefined();
    expect(screen.getByText(/Bookmark Front Scan/i)).toBeDefined();
    const matches = screen.getAllByPlaceholderText(/e.g. Gotham Book Mart/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
