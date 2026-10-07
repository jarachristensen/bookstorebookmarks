import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditableReleasesPage } from "@/components/pages/EditableReleasesPage";
import { Footer } from "@/components/ui/Footer";

// Mock fetch
global.fetch = vi.fn();

describe("Release Notes Page & Footer Integration", () => {
  it("renders Release Notes page with title, date, and formatted notes", () => {
    render(
      <EditableReleasesPage
        initialContent={{
          release_date: "October 2026",
          release_title: "Autumn 2026 Release",
          release_notes: "- Added interactive timeline thumbnails\n- Improved image zoom",
        }}
      />
    );

    expect(screen.getByRole("heading", { name: /Release Notes/i })).toBeDefined();
    expect(screen.getByText("Autumn 2026 Release")).toBeDefined();
    expect(screen.getByText("October 2026")).toBeDefined();
    expect(screen.getByText(/Added interactive timeline thumbnails/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Edit Notes/i })).toBeDefined();
  });

  it("toggles edit mode when Edit Notes button is clicked", () => {
    render(<EditableReleasesPage />);

    const editBtn = screen.getByRole("button", { name: /Edit Notes/i });
    fireEvent.click(editBtn);

    // Edit fields should now be visible
    expect(screen.getByPlaceholderText(/e\.g\. October 2026/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Autumn 2026 Collection Release/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Write release notes/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDefined();
  });

  it("Footer includes link to Release Notes", () => {
    render(<Footer />);

    const releaseLink = screen.getByRole("link", { name: /Release Notes/i });
    expect(releaseLink).toBeDefined();
    expect(releaseLink.getAttribute("href")).toBe("/releases");
  });
});
