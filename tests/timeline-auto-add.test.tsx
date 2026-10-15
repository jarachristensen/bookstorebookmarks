import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaManager } from "@/components/admin/MediaManager";

describe("MediaManager Auto-Add to Timeline Toggle", () => {
  it("renders auto-add to timeline checkbox for newspaper clippings", () => {
    render(
      <MediaManager
        mediaList={[]}
        onChange={vi.fn()}
        onAutoAddToTimeline={vi.fn()}
      />
    );

    expect(screen.getByText(/Auto-add to Timeline/i)).toBeDefined();
  });

  it("allows toggling the Auto-add to Timeline option", () => {
    render(
      <MediaManager
        mediaList={[]}
        onChange={vi.fn()}
        onAutoAddToTimeline={vi.fn()}
      />
    );

    const checkbox = screen.getByLabelText(/Auto-add to Timeline/i) as HTMLInputElement;
    expect(checkbox).toBeDefined();
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });
});
