import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkZoomLightbox } from "@/components/exhibit/BookmarkZoomLightbox";

describe("BookmarkZoomLightbox Component", () => {
  it("renders when isOpen is true with title and image", () => {
    const handleClose = vi.fn();
    render(
      <BookmarkZoomLightbox
        isOpen={true}
        onClose={handleClose}
        imageUrl="/seed-images/gotham-front.svg"
        alt="Gotham Book Mart Front"
        title="Gotham Book Mart Letterpress"
        subtitle="New York, United States"
      />
    );

    expect(screen.getByText("Gotham Book Mart Letterpress")).toBeDefined();
    expect(screen.getByText("New York, United States")).toBeDefined();
    expect(screen.getByAltText("Gotham Book Mart Front")).toBeDefined();
    expect(screen.getByRole("button", { name: /close/i })).toBeDefined();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <BookmarkZoomLightbox
        isOpen={false}
        onClose={() => {}}
        imageUrl="/seed-images/gotham-front.svg"
        alt="Gotham Front"
        title="Gotham"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("handles zoom controls (+, -, reset)", () => {
    render(
      <BookmarkZoomLightbox
        isOpen={true}
        onClose={() => {}}
        imageUrl="/seed-images/gotham-front.svg"
        alt="Gotham Front"
        title="Gotham"
      />
    );

    const zoomInBtn = screen.getByRole("button", { name: /zoom in/i });
    const zoomOutBtn = screen.getByRole("button", { name: /zoom out/i });
    const resetBtn = screen.getByRole("button", { name: /reset/i });

    expect(screen.getByText(/100%/)).toBeDefined();

    fireEvent.click(zoomInBtn);
    expect(screen.queryByText(/100%/)).toBeNull(); // scale changed

    fireEvent.click(resetBtn);
    expect(screen.getByText(/100%/)).toBeDefined();

    fireEvent.click(zoomOutBtn);
  });

  it("triggers side flip when flip button is clicked", () => {
    const handleToggleFlip = vi.fn();
    render(
      <BookmarkZoomLightbox
        isOpen={true}
        onClose={() => {}}
        imageUrl="/seed-images/gotham-front.svg"
        alt="Gotham Front"
        title="Gotham"
        flipSide={{
          current: "front",
          onToggle: handleToggleFlip,
          hasBack: true,
        }}
      />
    );

    const flipBtn = screen.getByRole("button", { name: /flip to verso|flip to back/i });
    fireEvent.click(flipBtn);
    expect(handleToggleFlip).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button or escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <BookmarkZoomLightbox
        isOpen={true}
        onClose={handleClose}
        imageUrl="/seed-images/gotham-front.svg"
        alt="Gotham Front"
        title="Gotham"
      />
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
