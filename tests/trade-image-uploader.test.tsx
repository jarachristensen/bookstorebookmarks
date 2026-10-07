import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TradeImageUploader } from "@/components/trading/TradeImageUploader";

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("TradeImageUploader Component", () => {
  it("renders upload trigger and displays uploaded thumbnail previews", () => {
    const onChange = vi.fn();
    const images = [
      "/uploads/trades/trade-1.jpg",
      "/uploads/trades/trade-2.jpg",
    ];

    render(
      <TradeImageUploader
        images={images}
        onChange={onChange}
        maxImages={5}
      />
    );

    expect(screen.getByText(/2 of 5 uploaded/i)).toBeDefined();
    expect(screen.getByAltText("Offered bookmark 1")).toBeDefined();
    expect(screen.getByAltText("Offered bookmark 2")).toBeDefined();
    expect(screen.getByText(/\+ Add Photo/i)).toBeDefined();
  });

  it("removes an image when delete button is clicked", () => {
    const onChange = vi.fn();
    const images = [
      "/uploads/trades/trade-1.jpg",
      "/uploads/trades/trade-2.jpg",
    ];

    render(
      <TradeImageUploader
        images={images}
        onChange={onChange}
        maxImages={5}
      />
    );

    const removeButtons = screen.getAllByTitle("Remove photo");
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(["/uploads/trades/trade-2.jpg"]);
  });
});
