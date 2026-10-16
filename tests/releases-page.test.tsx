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

  it("renders Add Release button on Release Notes page", () => {
    render(<EditableReleasesPage />);

    const addBtn = screen.getByRole("button", { name: /Add Release/i });
    expect(addBtn).toBeDefined();
  });

  it("clicking Add Release prepends a new pre-populated release post in edit mode", () => {
    render(
      <EditableReleasesPage
        initialContent={{
          release_date: "October 2026",
          release_title: "Initial Release",
          release_notes: "- First initial feature",
        }}
      />
    );

    const addBtn = screen.getByRole("button", { name: /Add Release/i });
    fireEvent.click(addBtn);

    // Should now show input fields with pre-populated content
    const titleInputs = screen.getAllByPlaceholderText(/e\.g\. Autumn 2026 Collection Release/i);
    expect(titleInputs.length).toBeGreaterThanOrEqual(1);

    // Notes textarea should have pre-populated template
    expect(screen.getByText(/### What's New & Enhancements/i)).toBeDefined();

    // Save Changes button should be visible
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeDefined();
  });

  it("Footer includes link to Release Notes", () => {
    render(<Footer />);

    const releaseLink = screen.getByRole("link", { name: /Release Notes/i });
    expect(releaseLink).toBeDefined();
    expect(releaseLink.getAttribute("href")).toBe("/releases");
  });
});
